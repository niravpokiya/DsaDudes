FROM gcc:13

# Create non-root user
RUN useradd -m sandbox

WORKDIR /workspace

# Give ownership to sandbox user
RUN chown -R sandbox:sandbox /workspace

USER sandbox

CMD ["sleep", "infinity"]