package com.DsaDude.Question_service.Services;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.DsaDude.Question_service.Model.Example;
import com.DsaDude.Question_service.Model.Question;
import com.DsaDude.Question_service.Repository.QuestionRepository;

@Service
public class TestcaseService {

    @Value("${testcase.storage.path:testcases}")
    private String basePath;

    @Autowired
    private QuestionRepository questionRepository;

    private static final Pattern SAMPLE_PATTERN = Pattern.compile("^sample[1-3]$");

    private Path resolveStorageBaseDir() {
        Path configuredPath = Paths.get(basePath);
        if (configuredPath.isAbsolute()) {
            return configuredPath.normalize();
        }

        Path currentDir = Paths.get(System.getProperty("user.dir")).toAbsolutePath().normalize();

        for (Path cursor = currentDir; cursor != null; cursor = cursor.getParent()) {
            if (Files.exists(cursor.resolve("pom.xml")) && Files.exists(cursor.resolve("src"))) {
                Path parent = cursor.getParent();
                if (parent != null) {
                    return parent.resolve("testcases").normalize();
                }
            }

            if (Files.exists(cursor.resolve("backend"))) {
                return cursor.resolve("backend").resolve("testcases").normalize();
            }
        }

        return currentDir.resolve("backend").resolve("testcases").normalize();
    }

    private Path resolveProblemTestcaseDir(String problemSlug) {
        return resolveStorageBaseDir().resolve(problemSlug).normalize();
    }

    public void uploadTestcases(String problemId, String problemSlug, MultipartFile zipFile) {
        if (problemId == null || problemId.isBlank()) {
            throw new IllegalArgumentException("Problem id is required");
        }

        if (problemSlug == null || problemSlug.isBlank()) {
            throw new IllegalArgumentException("Problem slug is required");
        }

        if (questionRepository.findById(problemId).isEmpty()) {
            throw new NoSuchElementException("Problem not found");
        }

        Question question = questionRepository.findById(problemId).orElseThrow();
        validateZip(zipFile);

        Path baseDir = resolveStorageBaseDir();
        Path targetDir = resolveProblemTestcaseDir(problemSlug);
        Path stagingDir = null;

        try {
            Files.createDirectories(baseDir);
            stagingDir = Files.createTempDirectory(baseDir, problemSlug + "-");
            List<Example> sampleExamples = unzipAndValidate(zipFile.getInputStream(), stagingDir);
            replaceDirectory(targetDir, stagingDir);
            applyQuestionExamples(question, sampleExamples);
            questionRepository.save(question);
        } catch (IOException e) {
            cleanupDirectory(stagingDir);
            throw new IllegalStateException("Failed to store testcases: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            cleanupDirectory(stagingDir);
            throw e;
        }
    }

    private void validateZip(MultipartFile zipFile) {
        if (zipFile == null || zipFile.isEmpty()) {
            throw new IllegalArgumentException("Zip file is empty");
        }

        String name = zipFile.getOriginalFilename();
        if (name == null || !name.toLowerCase().endsWith(".zip")) {
            throw new IllegalArgumentException("Only zip files are allowed");
        }
    }

    // unzipping uploaded file and validating it
    private List<Example> unzipAndValidate(InputStream inputStream, Path targetDir) throws IOException {
        Set<String> inputBases = new HashSet<>();
        Set<String> outputBases = new HashSet<>();
        Map<String, String> sampleInputs = new LinkedHashMap<>();
        Map<String, String> sampleOutputs = new LinkedHashMap<>();

        try (ZipInputStream zis = new ZipInputStream(inputStream)) {
            ZipEntry entry;
            boolean foundAnyFile = false;

            while ((entry = zis.getNextEntry()) != null) {
                if (entry.isDirectory()) {
                    continue;
                }

                foundAnyFile = true;

                String fileName = Paths.get(entry.getName()).getFileName().toString();

                // no folders allowed
                if (entry.getName().contains("/")) {
                    throw new IllegalArgumentException("Folders inside zip are not allowed");
                }

                if (!(fileName.endsWith(".in") || fileName.endsWith(".out"))) {
                    throw new IllegalArgumentException("Invalid file: " + fileName + ". Only .in and .out files are allowed");
                }

                byte[] entryBytes = zis.readAllBytes();

                String baseName;
                if (fileName.endsWith(".in")) {
                    baseName = fileName.substring(0, fileName.length() - 3);
                    validateBaseName(baseName);
                    inputBases.add(baseName);
                    if (baseName.startsWith("sample")) {
                        sampleInputs.put(baseName, new String(entryBytes, StandardCharsets.UTF_8));
                    }
                } else {
                    baseName = fileName.substring(0, fileName.length() - 4);
                    validateBaseName(baseName);
                    outputBases.add(baseName);
                    if (baseName.startsWith("sample")) {
                        sampleOutputs.put(baseName, new String(entryBytes, StandardCharsets.UTF_8));
                    }
                }

                Path filePath = targetDir.resolve(fileName).normalize();

                // zip slip prevention
                if (!filePath.startsWith(targetDir)) {
                    throw new IllegalArgumentException("Invalid zip structure");
                }

                Files.createDirectories(targetDir);
                Files.write(filePath, entryBytes);
                zis.closeEntry();
            }

            if (!foundAnyFile) {
                throw new IllegalArgumentException("Zip file does not contain any testcase files");
            }
        }
        validatePairs(inputBases, outputBases);
        return buildSampleExamples(sampleInputs, sampleOutputs);
    }

    private void validateBaseName(String baseName) {
        if (baseName.startsWith("sample")) {
            if (!SAMPLE_PATTERN.matcher(baseName).matches()) {
                throw new IllegalArgumentException("Sample files must be named sample1, sample2, or sample3");
            }
            return;
        }

        if (baseName.isBlank()) {
            throw new IllegalArgumentException("Invalid testcase filename");
        }
    }

    // matching inputs with corresponding outputs
    private void validatePairs(Set<String> inputs, Set<String> outputs) {
        if (inputs.isEmpty() || outputs.isEmpty()) {
            throw new IllegalArgumentException("Zip must contain at least one matching .in and .out testcase pair");
        }

        for (String base : inputs) {
            if (!outputs.contains(base)) {
                throw new IllegalArgumentException("Missing corresponding .out file for: " + base);
            }
        }

        for (String base : outputs) {
            if (!inputs.contains(base)) {
                throw new IllegalArgumentException("Missing corresponding .in file for: " + base);
            }
        }
    }

    private void replaceDirectory(Path targetDir, Path stagingDir) throws IOException {
        if (Files.exists(targetDir)) {
            cleanupDirectory(targetDir);
        }

        Files.move(stagingDir, targetDir, StandardCopyOption.REPLACE_EXISTING);
    }

    public void deleteTestcases(String problemSlug) {
        Path dir = resolveProblemTestcaseDir(problemSlug);

        if (!Files.exists(dir)) {
            return;
        }

        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException e) {
            throw new IllegalStateException("Failed deleting old testcases", e);
        }
    }

    private void cleanupDirectory(Path dir) {
        if (dir == null || !Files.exists(dir)) {
            return;
        }

        try (Stream<Path> walk = Files.walk(dir)) {
            walk.sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (IOException ignored) {
            // best effort cleanup
        }
    }

    private List<Example> buildSampleExamples(Map<String, String> sampleInputs, Map<String, String> sampleOutputs) {
        List<Example> examples = new ArrayList<>();

        for (String sampleName : List.of("sample1", "sample2", "sample3")) {
            if (sampleInputs.containsKey(sampleName) && sampleOutputs.containsKey(sampleName)) {
                examples.add(createExample(sampleInputs.get(sampleName), sampleOutputs.get(sampleName)));
            }
        }

        return examples;
    }

    private Example createExample(String input, String output) {
        Example example = new Example();

        try {
            Field inputField = Example.class.getDeclaredField("input");
            Field outputField = Example.class.getDeclaredField("output");
            Field explanationField = Example.class.getDeclaredField("explanation");

            inputField.setAccessible(true);
            outputField.setAccessible(true);
            explanationField.setAccessible(true);

            inputField.set(example, input);
            outputField.set(example, output);
            explanationField.set(example, null);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Failed building sample example", e);
        }

        return example;
    }

    private void applyQuestionExamples(Question question, List<Example> sampleExamples) {
        if (sampleExamples.isEmpty()) {
            return;
        } 
        try {
            Field examplesField = Question.class.getDeclaredField("examples");
            examplesField.setAccessible(true);
            examplesField.set(question, sampleExamples);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Failed updating question examples", e);
        }
    }


    public Map<String, Object> getTestcaseStatus(String problemId, String problemSlug) {
        if (problemId == null || problemId.isBlank()) {
            throw new IllegalArgumentException("Problem id is required");
        }

        if (problemSlug == null || problemSlug.isBlank()) {
            throw new IllegalArgumentException("Problem slug is required");
        }

        if (questionRepository.findById(problemId).isEmpty()) {
            throw new NoSuchElementException("Problem not found");
        }

        Path testcaseDir = resolveProblemTestcaseDir(problemSlug);
        boolean uploaded = hasUploadedTestcases(testcaseDir);

        Map<String, Object> status = new LinkedHashMap<>();
        status.put("problemId", problemId);
        status.put("problemSlug", problemSlug);
        status.put("uploaded", uploaded);
        status.put("downloadAvailable", uploaded);
        status.put("fileCount", uploaded ? countFiles(testcaseDir) : 0);
        status.put("downloadFileName", uploaded ? problemSlug + "-testcases.zip" : null);

        return status;
    }

    public byte[] downloadTestcasesZip(String problemId, String problemSlug) throws IOException {
        if (problemId == null || problemId.isBlank()) {
            throw new IllegalArgumentException("Problem id is required");
        }

        if (problemSlug == null || problemSlug.isBlank()) {
            throw new IllegalArgumentException("Problem slug is required");
        }

        if (questionRepository.findById(problemId).isEmpty()) {
            throw new NoSuchElementException("Problem not found");
        }

        Path testcaseDir = resolveProblemTestcaseDir(problemSlug);
        if (!hasUploadedTestcases(testcaseDir)) {
            throw new NoSuchElementException("No uploaded testcases found for this problem");
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        try (ZipOutputStream zipOutputStream = new ZipOutputStream(outputStream);
             Stream<Path> walk = Files.walk(testcaseDir)) {

            Path[] files = walk.filter(Files::isRegularFile)
                    .sorted()
                    .toArray(Path[]::new);

            for (Path path : files) {
                String entryName = testcaseDir.relativize(path).toString().replace(File.separatorChar, '/');
                zipOutputStream.putNextEntry(new ZipEntry(entryName));
                Files.copy(path, zipOutputStream);
                zipOutputStream.closeEntry();
            }
        }

        return outputStream.toByteArray();
    }

    private boolean hasUploadedTestcases(Path testcaseDir) {
        if (!Files.exists(testcaseDir) || !Files.isDirectory(testcaseDir)) {
            return false;
        }

        try (Stream<Path> walk = Files.walk(testcaseDir)) {
            return walk.anyMatch(Files::isRegularFile);
        } catch (IOException e) {
            throw new IllegalStateException("Failed checking testcase status", e);
        }
    }

    private long countFiles(Path testcaseDir) {
        try (Stream<Path> walk = Files.walk(testcaseDir)) {
            return walk.filter(Files::isRegularFile).count();
        } catch (IOException e) {
            throw new IllegalStateException("Failed counting testcase files", e);
        }
    }
}