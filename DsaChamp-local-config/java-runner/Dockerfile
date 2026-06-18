FROM eclipse-temurin:21-jdk-jammy

RUN useradd -m sandbox

WORKDIR /workspace

RUN chown -R sandbox:sandbox /workspace

USER sandbox

CMD ["sleep", "infinity"]
