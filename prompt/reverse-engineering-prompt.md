# Deep Technical Research & Reverse Engineering Prompt

I want you to act as a senior software architect, staff engineer, systems designer, security engineer, and technical researcher.

Your goal is to help me deeply understand how the following system, framework, product, protocol, coding agent, platform, or architecture is designed and implemented:

> **Topic:** `<INSERT TOPIC HERE>`

Assume I am an experienced software engineer.

Do **not** give me a marketing summary, beginner-level explanation, or feature overview.

Instead, reverse-engineer the system from first principles and infer how it is likely implemented internally.

Whenever possible:

- Think like an engineer who has access to the architecture but not the source code.
- Separate facts from assumptions.
- Explain trade-offs and design decisions.
- Use diagrams, pseudocode, and examples.
- Prefer technical depth over breadth.
- Highlight areas where the architecture is uncertain.

---

# 1. Problem Statement

Explain:

- What problem this system solves
- Why existing solutions were insufficient
- Business requirements
- Technical requirements
- Non-functional requirements
  - Scalability
  - Security
  - Reliability
  - Maintainability
  - Cost efficiency
  - Performance

---

# 2. High-Level Architecture

Create a mental model of the entire system.

Describe:

- Major components
- Component responsibilities
- Data flow
- Control flow
- Trust boundaries
- Security boundaries
- External dependencies

Provide an ASCII architecture diagram.

Example:

```text
User
  │
  ▼
Frontend
  │
  ▼
API Gateway
  │
  ├── Auth Service
  ├── Business Service
  └── Reporting Service
           │
           ▼
      Database
```

---

# 3. Internal Component Design

For each major component explain:

- Purpose
- Responsibilities
- Internal modules
- State management
- Data structures
- Persistence mechanisms
- Communication methods
- Failure handling

Describe likely implementation patterns.

---

# 4. Technology Choices

Infer:

- Languages
- Frameworks
- Infrastructure
- Databases
- Queues
- Storage systems

Explain:

- Why these technologies were likely selected
- Alternative approaches
- Trade-offs
- Benefits and drawbacks

---

# 5. End-to-End Request Lifecycle

Walk through a complete request from start to finish.

Example:

```text
User Request
    ↓
Frontend
    ↓
API Gateway
    ↓
Authentication
    ↓
Authorization
    ↓
Business Logic
    ↓
Database
    ↓
Cache
    ↓
Response
```

Explain every step in detail.

---

# 6. Data Model

Infer the likely data model.

Describe:

- Core entities
- Relationships
- Database schema assumptions
- Primary keys
- Foreign keys
- Indexing strategy
- Partitioning strategy
- Caching strategy

Provide example schemas.

---

# 7. Security Architecture

Explain:

## Authentication

- Password
- OAuth
- OIDC
- SAML
- API keys
- Certificates

## Authorization

- RBAC
- ABAC
- ReBAC
- Policy engines

## Session Management

- JWT
- Cookies
- Tokens

## Secret Management

- Vault
- KMS
- Secret rotation

## Threat Model

Describe:

- Attack surface
- Common attack vectors
- Security controls
- Security trade-offs

---

# 8. Scalability Design

Explain how the system scales.

Cover:

- Horizontal scaling
- Vertical scaling
- Stateless services
- Load balancing
- Distributed caching
- Queue systems
- Event-driven architecture
- Database scaling
- Multi-region architecture

Discuss bottlenecks.

---

# 9. Reliability & Resilience

Explain:

- Error handling
- Retry strategies
- Circuit breakers
- Timeouts
- Dead-letter queues
- Disaster recovery
- High availability
- Backup strategy

Provide examples.

---

# 10. Deployment Architecture

Infer how the system is likely deployed.

Cover:

- Local development
- Build process
- CI/CD
- Containers
- Kubernetes
- Cloud infrastructure
- Infrastructure as Code

Provide a deployment diagram.

---

# 11. Observability

Explain:

## Logging

- Application logs
- Audit logs
- Security logs

## Monitoring

- Metrics
- Dashboards

## Tracing

- Distributed tracing
- Correlation IDs

## Alerting

- Threshold alerts
- Anomaly detection

---

# 12. Performance Engineering

Explain:

- Latency optimization
- Throughput optimization
- Query optimization
- Caching strategies
- Memory usage
- CPU usage
- Network efficiency

Identify likely performance bottlenecks.

---

# 13. Source Code Reconstruction

Based on the architecture, infer the likely codebase structure.

Example:

```text
src/
├── api/
├── controller/
├── service/
├── repository/
├── domain/
├── security/
├── infrastructure/
├── config/
└── tests/
```

Explain:

- Package organization
- Layering strategy
- Design patterns
- Dependency management

Provide pseudocode where useful.

---

# 14. Developer Workflow

Infer:

- Branching strategy
- Pull request workflow
- Testing strategy
- Release process
- Versioning approach

Explain how engineering teams likely work on this system.

---

# 15. Building a Simplified Version

If I wanted to build an MVP version myself:

Describe:

- Minimum viable architecture
- Recommended technology stack
- Folder structure
- Database design
- APIs
- Infrastructure

Provide an implementation roadmap:

Phase 1 → MVP

Phase 2 → Production Ready

Phase 3 → Enterprise Scale

---

# 16. Design Trade-offs

Explain:

- What the designers optimized for
- What they sacrificed
- Known limitations
- Technical debt risks
- Operational risks
- Future evolution paths

---

# 17. Interview-Level Understanding

Provide:

## 30-Second Explanation

A concise executive summary.

## 5-Minute Explanation

An engineer-level overview.

## Staff Engineer Explanation

A deep architectural discussion.

## Common Interview Questions

Generate likely interview questions and answers.

---

# 18. Unknowns and Assumptions

Create a table:

| Area | Assumption | Confidence | Reasoning |
|--------|--------|--------|--------|
| Example | Uses PostgreSQL | Medium | Common architecture pattern |

Clearly separate:

- Verified facts
- Reasonable assumptions
- Speculation

---

# 19. Agent Reverse Engineering (For AI Systems)

If the topic involves AI agents, coding assistants, LLM applications, RAG systems, or autonomous workflows, explain:

## Agent Architecture

- Core agent loop
- Planning mechanism
- Execution engine

## Context Management

- Prompt construction
- Context windows
- Context compression
- Context retrieval

## Memory System

- Short-term memory
- Long-term memory
- Vector storage
- Knowledge retrieval

## Tool Calling

- Tool registry
- Function calling
- MCP integration
- Error handling

## Planning

- ReAct
- Chain of Thought
- Tree of Thoughts
- Reflection

## Multi-Agent Design

- Coordinator agent
- Worker agents
- Reviewer agents

## Cost Optimization

- Token management
- Context pruning
- Model routing

## Failure Recovery

- Retry logic
- Self-correction
- Human escalation

Provide a reconstructed execution flow:

```text
User Prompt
      ↓
Planner
      ↓
Task Breakdown
      ↓
Tool Selection
      ↓
Execution
      ↓
Verification
      ↓
Response Generation
      ↓
Final Output
```

---

# 20. Deliverable Format

Structure the response as:

1. Executive Summary
2. Architecture Overview
3. Deep Technical Analysis
4. Security Analysis
5. Scalability Analysis
6. Source Code Reconstruction
7. Implementation Guide
8. Design Trade-offs
9. Interview Preparation
10. Assumptions & Unknowns

Use:

- ASCII diagrams
- Tables
- Sequence diagrams
- Pseudocode
- Real-world examples

Prioritize technical depth, architectural reasoning, and implementation details over product descriptions.