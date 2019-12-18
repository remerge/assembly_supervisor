# Assembly Supervisor

A kubernetes dashboard specifically for Cron Jobs

## Development

This is still in early stages of development and specific to our use case. Assembly supervisor makes certain assumptions that may not be true for your project.

1. All cron jobs are in the default use case
2. All jobs are triggered by cron jobs
3. Each pod only runs one container

In the future this may be improved but be aware that these assumptions are currently hard coded
