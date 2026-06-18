Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$configDir = Split-Path -Parent $MyInvocation.MyCommand.Path

$runners = @(
    @{ Path = "cpp-runner"; Image = "cpp-runner" },
    @{ Path = "java-runner"; Image = "java-runner" },
    @{ Path = "python-runner"; Image = "python-runner" }
)

foreach ($runner in $runners) {
    $runnerPath = Join-Path $configDir $runner.Path
    Write-Host "Building $($runner.Image) from $runnerPath"
    docker build -t $runner.Image $runnerPath
}

