# pg-boss-dashboard

PG-Boss Queue Jobs Dashboard

## Screenshots

### Queue Overview

![Queue Overview](docs/images/queue-overview.jpeg)
_Dashboard showing all queues with their current status_

### Queue Details

![Queue Details](docs/images/queue-details.jpeg)
_Detailed view of a specific queue with job history_

## Usage

### Run in Docker

```bash
npm run docker:build
npm run docker:run
```

### Run in Docker Compose

```bash
docker compose up
```

### Run locally

```bash
npm run start:dev:ui
npm run start:dev:server
```
