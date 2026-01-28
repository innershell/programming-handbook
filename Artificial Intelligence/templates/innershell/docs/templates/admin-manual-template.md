# Administration Manual: [Service/Component Name]

## Overview

Brief description of the AWS service or component being configured. Include:

- What this service does in the context of your system
- Why this particular configuration is needed
- How it integrates with other services

## Prerequisites

### AWS Account Setup

- Required AWS account permissions/roles
- IAM policies needed
- Billing considerations/cost estimates

### Dependencies

- Other AWS services that must be configured first
- Required networking setup (VPC, subnets, security groups)
- Third-party integrations or tools needed

## Service Configuration

### Initial Setup

1. **Service Creation**

   - Step-by-step instructions for creating the service through AWS Console
   - Alternative CLI commands with exact syntax
   - Required parameters and their values

2. **Basic Configuration**
   - Essential settings that must be configured
   - Security settings and best practices
   - Network configuration details

### Advanced Configuration

1. **Performance Optimization**

   - Recommended settings for production environments
   - Scaling configuration
   - Monitoring and alerting setup

2. **Security Hardening**
   - Security group rules
   - IAM role assignments
   - Encryption settings
   - Access logging configuration

## Environment-Specific Settings

### Development Environment

- Configuration values for dev environment
- Reduced costs/simplified setup options
- Debug/testing specific settings

### Staging Environment

- Production-like configuration for testing
- Data migration/sync considerations
- Performance testing setup

### Production Environment

- High availability configuration
- Backup and disaster recovery settings
- Monitoring and alerting thresholds
- Maintenance windows and procedures

## Integration Points

### API Endpoints

- Service endpoints and how to access them
- Authentication methods
- Rate limiting and quotas

### Data Flow

- How data moves in/out of this service
- Dependencies on other services
- Data format requirements

### Monitoring Integration

- CloudWatch metrics to monitor
- Custom dashboards setup
- Alert configuration

## Troubleshooting

### Common Issues

1. **[Issue Type]**
   - Symptoms
   - Root cause analysis steps
   - Resolution procedure
   - Prevention measures

### Debugging Tools

- AWS CLI commands for diagnostics
- CloudWatch logs location and interpretation
- Third-party monitoring tools integration

### Emergency Procedures

- Service outage response
- Data recovery procedures
- Rollback procedures
- Escalation contacts

## Maintenance

### Regular Tasks

- Daily/weekly/monthly maintenance checklist
- Log rotation and cleanup
- Performance monitoring review
- Security audit procedures

### Updates and Patches

- Update procedures for the service
- Testing requirements before applying updates
- Rollback procedures if updates fail

### Backup and Recovery

- Backup schedules and procedures
- Recovery testing procedures
- RTO/RPO requirements

## Tips and Best Practices

### Cost Optimization

- Strategies to minimize AWS costs
- Resource right-sizing recommendations
- Reserved instance considerations

### Performance Tips

- Configuration tweaks for better performance
- Monitoring metrics to watch
- When to scale up/out

### Security Best Practices

- Access control recommendations
- Audit logging setup
- Compliance considerations

## Quick Reference

### Key Configuration Values

```
Parameter Name: Value/Description
Region: [AWS Region]
Instance Type: [Type and reasoning]
Storage: [Configuration details]
```

### Important URLs

- AWS Console links for this service
- Documentation references
- Internal monitoring dashboards

### CLI Commands Cheat Sheet

```bash
# Service status check
aws [service] describe-[resource] --region [region]

# Common configuration command
aws [service] [action] --parameter value

# Troubleshooting command
aws logs describe-log-groups --log-group-name-prefix [prefix]
```

## Documentation History

| Date       | Author | Changes                            |
| ---------- | ------ | ---------------------------------- |
| YYYY-MM-DD | [Name] | Initial creation                   |
| YYYY-MM-DD | [Name] | Updated configuration for [reason] |

## LLM Prompt (for future re-use)

Create/update the administration manual for [AWS Service Name] following the admin-manual-template.md. Focus on practical setup instructions, troubleshooting tips, and operational procedures specific to our system requirements.

---

## Template Notes

When using this template:

1. Replace all bracketed placeholders with actual values
2. Remove sections that don't apply to your specific service
3. Add service-specific sections as needed
4. Include actual screenshots or diagrams where helpful
5. Update the documentation history table when making changes
6. Consider creating separate documents for complex multi-service setups
