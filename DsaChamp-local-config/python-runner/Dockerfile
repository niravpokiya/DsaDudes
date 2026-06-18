FROM python:3.12-slim

USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends bash coreutils \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m sandbox

WORKDIR /workspace

RUN chown -R sandbox:sandbox /workspace

USER sandbox

CMD ["sleep", "infinity"]
