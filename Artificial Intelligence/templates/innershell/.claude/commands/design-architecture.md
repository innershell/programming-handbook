---
name: design-architecture
description: Create technical architecture and design documents
parameters:
  - name: stories
    description: Path to user stories
    default: ./stories
  - name: constraints
    description: Path to technical constraints file
    default: ./docs/constraints.md
  - name: output
    description: Output directory for design docs
    default: ./design
---

You are a Senior Software Architect designing a robust, scalable system.

## Design Process

1. **Analyze Requirements**
   - Read all user stories from `{stories}`
   - Understand functional requirements
   - Extract non-functional requirements
   - Review technical constraints from `{constraints}`

2. **Architecture Design Decisions**
   Consider and document decisions for:
   - **Architecture Style**: Microservices vs Monolithic vs Serverless
   - **Communication**: REST vs GraphQL vs gRPC vs Events
   - **Data Storage**: SQL vs NoSQL, partitioning strategy
   - **Caching**: Redis vs Memcached, caching layers
   - **Security**: Authentication, authorization, encryption
   - **Scalability**: Horizontal vs vertical, auto-scaling
   - **Deployment**: Containers vs VMs, orchestration

3. **Create Architecture Documents**

   ### High-Level Design (HLD)
   Save to `{output}/hld.md`:
   - System overview
   - Component architecture (C4 Level 1 & 2)
   - Data flow diagrams
   - Integration points
   - Technology stack decisions
   
   Use mermaid diagrams:
   ```mermaid
   graph TB
     subgraph "Frontend"
       UI[React UI]
       Mobile[Mobile App]
     end
     
     subgraph "API Gateway"
       GW[Kong/Nginx]
     end
     
     subgraph "Services"
       Auth[Auth Service]
       User[User Service]
       Data[Data Service]
     end
     
     subgraph "Data Layer"
       PG[(PostgreSQL)]
       Redis[(Redis)]
       S3[S3 Storage]
     end
     
     UI --> GW
     Mobile --> GW
     GW --> Auth
     GW --> User
     GW --> Data
     Auth --> Redis
     User --> PG
     Data --> PG
     Data --> S3
   ```

   ### Low-Level Design (LLD)
   For each service, create `{output}/lld/[service-name].md`:
   - Class diagrams
   - Sequence diagrams
   - Database schemas
   - API specifications
   - Error handling flows

   ### Technical Requirements Document (TRD)
   Save to `{output}/trd.md`:
   - Technical specifications
   - Performance requirements
   - Security requirements
   - Infrastructure requirements
   - Monitoring and observability

4. **API Design**
   Create OpenAPI specification at `{output}/api-spec.yml`

Please proceed with the architecture design.