# ImgPull V2 Architecture

## Goals

This version moves the project away from the old fixed `project -> version -> image` list and into a real image catalog, cache, and delivery workflow.

## Core Product Rules

### 1. Only search two sources

- First search the private default Harbor cache project.
- If the cache has no match, then search Docker Hub.
- Never search ordinary user namespaces as part of global search results.

### 2. Default cache is private

- The default Harbor project is an internal cache layer.
- Any image pulled from Docker Hub or another upstream source should land here first.
- This project is never the user-facing delivery address.

### 3. Access code becomes user namespace

- Each paid access code maps to one Harbor namespace or project name.
- Example: access code `KZABC123` can map to namespace `kzabc123`.
- The user only pulls images from their own namespace.

### 4. Catalog images are independent

- Images are stored in `catalog_images` as independent objects.
- They are not owned by a fixed public project anymore.
- A user can freely group any images into one or more custom projects.

### 5. User projects are only logical groups

- `user_projects_v2` is a business grouping layer.
- A user project is not the same thing as a Harbor project.
- It is used to organize which images belong together for that user.

## Search Priority

1. Search the local Harbor-backed cache first.
2. If the image is not found locally, query Docker Hub.
3. Cache the upstream result into `catalog_images` metadata.
4. When the user adds the image into a project, create a distribution task.

## Delivery Flow

1. User enters access code.
2. System resolves the user namespace.
3. User searches for an image.
4. System shows cache-first results.
5. User adds image to one of their own projects.
6. A distribution task is created.
7. A future sync worker will:
   - pull upstream image into the private cache if needed
   - tag or copy it into the user namespace
   - return the final pull address to the user

## Cache Retention Design

A system setting controls how long the default cache should retain images.

- `0`: do not retain cache after delivery
- `-1`: retain forever
- positive integer such as `7`: retain for that many days

This value is stored as `cache_retention_days` in system settings.

## Data Model

### Key tables

- `catalog_images`
  - independent image catalog records
  - local cache status
  - source and local full names
  - cache retention timestamps
- `user_projects_v2`
  - logical project groups per access code
- `user_project_images_v2`
  - joins images into user projects
- `distribution_tasks`
  - records queue state for delivery to user namespace
- `settings`
  - Harbor domain, cache project name, retention policy, visibility policy

## User Deletion Design

### Soft delete

- When a user is deleted, do not purge immediately.
- Mark the access code as `deleted`.
- Set `deleted_at` and `purge_after = deleted_at + 30 days`.
- During the grace period, the account is inactive but restorable.

### Final purge

- After 30 days, the user's namespace can be permanently purged.
- User project records can be deleted together.

### Cache cleanup

- Cache images must not be deleted only because one user expired.
- Delete from the private cache only when both conditions are true:
  - no active users still reference the image
  - the image has been unused longer than the configured retention policy

## UI Structure

### 1. Landing page

- explains cache-first behavior
- validates access code
- routes into the user console
- shows high-level system status

### 2. User console

- search images
- create logical projects
- add images into projects
- see target delivery addresses
- view recent distribution tasks

### 3. Admin dashboard

- edit Harbor domain and cache project name
- edit cache retention settings
- inspect queued tasks
- inspect soft-deleted users pending purge

## Why this is safer

- Users never depend directly on the private cache project.
- User namespaces are the only delivery layer.
- Ordinary user repositories do not pollute search results.
- Reuse improves over time because repeated requests hit the local cache.
- Retention and deletion policies are separated between user delivery and internal cache.
