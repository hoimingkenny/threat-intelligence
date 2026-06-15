# AI-Powered Threat Intelligence & Initial Impact Assessment MVP

## Overview

This project is a backend-only AI-powered Threat Intelligence platform that continuously monitors selected cyber threat sources, analyzes newly published security events using a Large Language Model (LLM), matches the affected products against an internal technology watchlist, and automatically generates an initial impact assessment.

The project is inspired by real-world operational requirements in enterprise security teams, where organizations may be required to complete an initial impact assessment within a strict SLA, for example within 2 hours of becoming aware of a major cyber event.

Instead of relying solely on traditional CVE databases or manual monitoring, this MVP aims to reduce the time required to identify whether a newly reported zero-day vulnerability or vendor-related cyber attack could affect the organization.

## Problem Statement

Modern cyber attacks evolve much faster than traditional vulnerability management processes.

For many high-profile incidents, the sequence is often:

1. Security researchers observe suspicious activity.
2. Threat intelligence teams publish preliminary findings.
3. Cyber news sites report active exploitation.
4. Vendor security advisories are released.
5. CVEs are assigned and enriched.
6. Official government advisories and KEV catalogs are updated.

Organizations that wait for formal CVE publication or official advisories may lose valuable response time.

Security teams therefore need a mechanism to:

- Continuously monitor trusted threat intelligence sources.
- Identify whether a reported event is relevant to the organization.
- Quickly determine whether internal technologies may be affected.
- Produce an initial impact assessment for analysts and management.

## Project Goal

Build a lightweight backend service that can:

- Poll trusted cyber threat intelligence feeds periodically.
- Detect newly published threat reports.
- Use an LLM to extract structured security information.
- Match extracted products against an internal product watchlist.
- Generate a machine-readable and human-readable initial impact assessment.
- Log the result for analyst review.

The system does not replace human analysts. It serves as an AI-assisted triage tool that reduces manual effort during the early stages of incident response.

## MVP Scope

### Included

- RSS feed collection.
- LLM-based threat information extraction.
- Internal product watchlist matching.
- Initial impact assessment generation.
- Console and log file output.

### Excluded

The first version intentionally excludes:

- Frontend dashboard.
- Database persistence.
- SIEM integration.
- SOAR automation.
- CMDB integration.
- Microsoft Teams or email notifications.
- Ticket creation.
- IOC extraction.
- Automatic patch recommendations.
- Automated remediation actions.

The MVP focuses only on the first stage of the threat intelligence workflow.

## High-Level Architecture

```text
+----------------------+
| Threat Intelligence  |
|      RSS Feeds       |
+----------+-----------+
           |
           v
+--------------------------+
|     Feed Collector       |
| (Spring Scheduled Task)  |
+------------+-------------+
             |
             v
+--------------------------+
|   New Threat Event Queue |
+------------+-------------+
             |
             v
+--------------------------+
|    LLM Threat Analyzer   |
|  - Vendor Extraction     |
|  - Product Extraction    |
|  - Severity Classification
|  - Active Exploitation   |
+------------+-------------+
             |
             v
+--------------------------+
|    Product Matcher       |
| (Internal Watchlist)     |
+------------+-------------+
             |
             v
+--------------------------+
| Initial Impact Assessment|
|       Generator          |
+------------+-------------+
             |
             v
+--------------------------+
| Console / File Log Output|
+--------------------------+
```

## Business Workflow

```text
New Threat Article Published
            |
            v
System polls RSS feeds every 10 minutes
            |
            v
New article detected?
       +----+----+
       |         |
      No        Yes
       |         |
       |         v
       |   Send article to LLM
       |         |
       |         v
       |   Extract threat information
       |         |
       |         v
       |   Match internal products
       |         |
       |         v
       |   Generate impact assessment
       |         |
       |         v
       +------> Log result
```

## MVP Tech Stack

| Layer | Technology |
| --- | --- |
| Language | Java 21 |
| Backend Framework | Spring Boot |
| Task Scheduling | Spring Scheduler |
| RSS Parsing | Rome |
| LLM Integration | LiteLLM + OpenAI / Azure OpenAI |
| Configuration | YAML |
| Logging | Logback |
| Storage | In-memory (MVP) |
| Build Tool | Maven |

## Threat Intelligence Sources

The MVP will monitor a curated list of trusted RSS feeds.

### Initial Feed List

```yaml
feeds:
  - name: BleepingComputer
    url: https://www.bleepingcomputer.com/feed/
  - name: The Hacker News
    url: https://feeds.feedburner.com/TheHackersNews
  - name: Mandiant Threat Intelligence
    url: https://cloud.google.com/blog/topics/threat-intelligence/rss.xml
  - name: Palo Alto Unit42
    url: https://unit42.paloaltonetworks.com/feed/
```

Additional feeds can be added later without changing the application architecture.

## Internal Product Watchlist

The MVP uses a simple YAML-based internal technology inventory.

### Example Configuration

```yaml
products:
  - name: Keycloak
    aliases:
      - Red Hat SSO
      - RHSSO
    owner: IAM Team
    criticality: Critical

  - name: CyberArk
    aliases:
      - CyberArk PVWA
      - CyberArk PAS
      - CyberArk PSM
    owner: PAM Team
    criticality: Critical

  - name: SailPoint IIQ
    aliases:
      - SailPoint IdentityIQ
      - IdentityIQ
    owner: IAM Team
    criticality: High

  - name: Spring Boot
    aliases:
      - Spring Framework
      - Spring Security
    owner: Application Team
    criticality: High

  - name: Red Hat Enterprise Linux
    aliases:
      - RHEL
      - Red Hat Linux
    owner: Infrastructure Team
    criticality: Critical
```

The watchlist acts as a lightweight substitute for a CMDB during the MVP stage.

## LLM Threat Analysis

Each threat article is analyzed by the LLM and converted into a structured JSON object.

### Example Output

```json
{
  "vendor": "Red Hat",
  "product": "Keycloak",
  "affected_versions": "Unknown",
  "severity": "Critical",
  "active_exploitation": true,
  "poc_available": false,
  "attack_type": "Authentication Bypass",
  "summary": "A critical authentication bypass vulnerability affecting Keycloak is reportedly under active exploitation."
}
```

The structured output simplifies downstream processing and enables deterministic product matching.

## Initial Impact Assessment Template

When a threat matches an internal product, the system generates a standard impact assessment.

### Example Output

```text
==========================================
INITIAL IMPACT ASSESSMENT
==========================================

Detected Time: 2026-06-15 10:22 SGT

Threat Source: BleepingComputer

Threat Title: Critical vulnerability in Keycloak under active exploitation

Threat Summary:
A critical authentication bypass vulnerability affecting Keycloak is reportedly under active exploitation.

Extracted Information:
- Vendor: Red Hat
- Product: Keycloak
- Severity: Critical
- Active Exploitation: Yes
- PoC Available: Unknown

Internal Product Match:
- Product: Keycloak
- Owner: IAM Team
- Business Criticality: Critical

Initial Assessment:
The organization uses Keycloak as part of its enterprise identity platform. Based on currently available information, there may be potential exposure. The IAM Team should verify deployed versions and review vendor guidance.

Status: Potentially Affected - Under Investigation

==========================================
```

## Project Structure

```text
src/main/java/com/company/threatintel
├── ThreatIntelApplication.java
├── scheduler
│   └── FeedPollingScheduler.java
├── collector
│   └── RssFeedCollector.java
├── analyzer
│   └── LlmThreatAnalyzer.java
├── matcher
│   └── ProductMatcher.java
├── assessment
│   └── ImpactAssessmentService.java
├── config
│   ├── FeedConfig.java
│   └── ProductWatchlistConfig.java
└── model
    ├── ThreatEvent.java
    ├── ThreatAnalysisResult.java
    ├── ProductWatchItem.java
    └── ImpactAssessment.java
```

## Implementation Plan

### Phase 1 - RSS Feed Collection

#### Objective

Build a scheduled service that continuously polls selected RSS feeds.

#### Tasks

- Create Spring Boot project.
- Configure RSS feed list in YAML.
- Integrate Rome RSS parser.
- Build scheduled polling job.
- Fetch and parse feed entries.
- Log newly discovered articles.
- Prevent duplicate processing during runtime.

#### Deliverable

The application can successfully collect and display new threat articles from multiple sources.

### Phase 2 - LLM Threat Analysis

#### Objective

Transform unstructured threat reports into structured security data.

#### Tasks

- Integrate LLM API.
- Design prompt template for cyber threat extraction.
- Force JSON response format.
- Parse and validate LLM output.
- Extract:
  - Vendor
  - Product
  - Severity
  - Attack type
  - Active exploitation status
  - PoC availability

#### Deliverable

Every collected article produces a structured threat analysis object.

### Phase 3 - Internal Product Matching

#### Objective

Determine whether the threat may affect the organization's technology stack.

#### Tasks

- Build YAML-based product registry.
- Load products and aliases into memory.
- Compare extracted products against watchlist.
- Support alias matching.
- Mark events as:
  - Matched
  - Unmatched
  - Unknown

#### Deliverable

The application correctly identifies threats related to monitored technologies.

### Phase 4 - Initial Impact Assessment Generation

#### Objective

Automatically generate a draft impact assessment.

#### Tasks

- Design assessment template.
- Combine threat data with watchlist metadata.
- Generate analyst-friendly summary.
- Produce structured log output.

#### Deliverable

The system generates a complete initial impact assessment for matched threats.

### Phase 5 - Stability Improvements

#### Objective

Prepare the MVP for continuous execution.

#### Tasks

- Add duplicate detection.
- Add retry logic for feed failures.
- Add timeout and exception handling.
- Improve logging.
- Add unit tests.
- Add configuration validation.

#### Deliverable

The application can run continuously with minimal manual intervention.

## Future Roadmap

After validating the MVP, future versions could include:

### Version 2

- PostgreSQL persistence.
- REST API.
- Microsoft Teams notifications.
- Email alerts.
- Vendor advisory feeds.
- CISA KEV integration.

### Version 3

- CMDB integration.
- SIEM integration.
- IOC extraction.
- MITRE ATT&CK mapping.
- Risk scoring engine.
- Automatic management report generation.

### Version 4

- AI-assisted incident response workflow.
- Multi-agent threat intelligence orchestration.
- Threat clustering and similarity analysis.
- Historical threat knowledge base.
- Automated impact assessment refinement using analyst feedback.

## Success Criteria

The MVP will be considered successful if it can:

- Continuously monitor multiple threat intelligence sources.
- Detect newly published cyber threat reports.
- Extract structured threat information using an LLM.
- Correctly identify whether a threat is related to internal products.
- Automatically generate a meaningful initial impact assessment.
- Produce the assessment within minutes of the original article becoming available.

## Project Value

This project demonstrates the practical application of AI and LLM technologies in enterprise cyber security operations.

It combines:

- Java backend engineering.
- Spring Boot microservice development.
- LLM-powered information extraction.
- Threat intelligence processing.
- Security domain modelling.
- Identity and access management awareness.
- AI-assisted operational decision support.

Rather than building a generic chatbot, this project focuses on solving a realistic enterprise security problem: reducing the time required to perform an initial impact assessment when a new cyber threat emerges.
