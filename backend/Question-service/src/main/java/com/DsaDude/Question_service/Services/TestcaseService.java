package com.DsaDude.Question_service.Services;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.*;
import java.nio.file.*;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class TestcaseService {
    @Value("${testcase.storage.path:testcase}")
    private String basePath;

    public void saveHiddenTestcases(String problemSlug, MultipartFile zipFile) {
        if (zipFile.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        deleteTestcases(problemSlug);
        Path targetDir = Paths.get(basePath, problemSlug);
        try {
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            unzipAndValidate(zipFile.getInputStream(), targetDir);

        } catch (IOException e) {
            throw new RuntimeException("Error saving testcases: " + e.getMessage(), e);
        }
    }

    private void unzipAndValidate(InputStream zipInputStream, Path targetDir) throws IOException {
        Set<String> inputBases = new HashSet<>();
        Set<String> outputBases = new HashSet<>();

        try (ZipInputStream zis = new ZipInputStream(zipInputStream)) {
            ZipEntry entry;

            while ((entry = zis.getNextEntry()) != null) {
                String fileName = entry.getName();
                Path newFilePath = targetDir.resolve(fileName).normalize();

                // avoid zip-slip vulnerability
                if (!newFilePath.startsWith(targetDir)) {
                    throw new IOException("Invalid zip entry: " + fileName);
                }

                // Only allow .in and .out files (ignore directories)
                if (!entry.isDirectory() && !(fileName.endsWith(".in") || fileName.endsWith(".out"))) {
                    throw new RuntimeException("Invalid file format: " + fileName);
                }

                // track base names
                if (!entry.isDirectory()) {
                    if (fileName.endsWith(".in")) {
                        inputBases.add(fileName.substring(0, fileName.length() - 3));
                    } else if (fileName.endsWith(".out")) {
                        outputBases.add(fileName.substring(0, fileName.length() - 4));
                    }
                }

                // create directories/files
                if (entry.isDirectory()) {
                    Files.createDirectories(newFilePath);
                } else {
                    Files.createDirectories(newFilePath.getParent());
                    try (OutputStream os = Files.newOutputStream(newFilePath)) {
                        zis.transferTo(os);
                    }
                }

                zis.closeEntry();
            }
        }

        // validate mappings
        for (String base : inputBases) {
            if (!outputBases.contains(base)) {
                throw new RuntimeException("Missing corresponding output file for: " + base);
            }
        }
        for (String base : outputBases) {
            if (!inputBases.contains(base)) {
                throw new RuntimeException("Missing corresponding input file for: " + base);
            }
        }
    }
    public void deleteTestcases(String problemSlug) {
        Path problemDir = Paths.get(basePath, problemSlug);

        if (Files.exists(problemDir)) {
            try {
                // Recursively delete folder and all its contents
                Files.walk(problemDir)
                        .sorted(Comparator.reverseOrder()) // delete children first
                        .map(Path::toFile)
                        .forEach(File::delete);
            } catch (IOException e) {
                throw new RuntimeException("Failed to delete old testcases for: " + problemSlug, e);
            }
        }
    }
}
