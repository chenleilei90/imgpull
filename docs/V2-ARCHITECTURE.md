# ImgPull V2 Architecture

## Goals

This version shifts the project from a fixed `project -> version -> image` list into a real image catalog and delivery pipeline.

## Core Model

### 1. Private cache project

- The default Harbor project is a private cache layer.
- Any image pulled from Docker Hub or another upstream source should land here first.
- This project is never the user-facing delivery address.

### 2. Access code becomes user namespace

- Each paid access code maps to one Harbor namespace or project name.
- Example: access code `KZABC123` can map to namespace `kzabc123`.
- The user only pulls images from their own namespace.

### 3. Catalog images are independent

- Images are stored in `catalog_images` as independent objects.
- They are not owned by a fixed public project anymore.
- A user can freely group any images into one or more custom projects.

### 4. User projects are only logical groups

- `user_projects_v2` is a business grouping layer.
- A user project is not the same thing as a Harbor project.
- It is used to organize which images belong together for that user.

## Search Priority

1. Search the local Harbor-backed catalog first.
2. If the image is not found locally, query Docker Hub.
3. Cache the upstream result into `catalog_images` metadata.
4. When the user requests delivery, create a sync task from cache to user namespace.

## Delivery Flow

1. User enters access code.
2. System resolves the user namespace.
3. User searches for an image.
4. System shows local-first results.
5. User adds image to one of their own projects.
6. A future sync worker will:
   - pull upstream image into the private cache if needed
   - tag or copy it into the user namespace
   - return the final pull address to the user

## Retention Design

### User deletion

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
  - the image has been unused for a long time

## Why this is safer

- Users never depend directly on the private cache project.
- The cache layer can be optimized independently.
- Reuse improves over time because repeated requests hit the local cache.
- User-facing pull addresses stay simple and consistent.
