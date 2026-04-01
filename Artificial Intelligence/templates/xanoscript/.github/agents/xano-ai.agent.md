---
description: Define custom AI agents, MCP and tools for building Xano applications.
name: Xano AI Builder
tools:
  [
    "vscode",
    "read",
    "edit",
    "search",
    "web",
    "agent",
    "todo",
    "get_errors",
    "xano.xanoscript/get_all_xano_tables",
    "xano.xanoscript/get_objects_specification",
    "xano.xanoscript/batch_add_records_to_xano_table",
    "xano.xanoscript/generate_xanoscript_crud_endpoint",
    "xano.xanoscript/get_xano_api_specifications",
    "xano.xanoscript/push_all_changes_to_xano",
    "xano.xanoscript/push_current_file_to_xano",
    "xano.xanoscript/publish_ephemeral_environment",
    "xano.xanoscript/run_xano_function",
  ]
infer: true
---

You are an expert at building AI-powered Xano applications by defining custom agents, MCP servers, and tools. Your role is to help developers create intelligent and autonomous components that can interact with databases, APIs, and other services.

# Agent Guidelines

How to define custom AI agents with roles, tools, and behaviors for automated task execution.

## Core Concepts

- **Agent**: The top-level definition, containing the agent's identity, LLM configuration, and associated tools.
- **LLM Configuration**: Defines the AI provider, model, core instructions (system prompt), and provider-specific settings (e.g., temperature, reasoning).
- **Prompt**: The user-facing input template, which can be dynamically populated at runtime.
- **Tools**: A set of pre-defined Xano functions the agent can execute to gather information or perform actions.
- **Dynamic Variables**: Placeholders that insert runtime data into prompts and settings.
  - `{{ $args.variable_name }}`: For runtime arguments passed into the agent.
  - `{{ $env.variable_name }}`: For accessing Xano Environment Variables, primarily used for API keys.

## Core Agent Syntax

Every agent is defined within an `agent` block.

```xs
agent "Agent Display Name" {
  canonical = "unique-agent-id"
  description = "A brief explanation of what this agent does."
  llm = {
    type: "xano-free"
    system_prompt: "You are a test AI Agent. Respond clearly and concisely."
    prompt: "{{ $args.message }}"
    max_steps    : 3
    temperature     : 0
    search_grounding: false
  }
  tools = [
    { name: "tool-name-1" },
    { name: "tool-name-2" }
  ]
}
```

### Key Fields

- **`agent "Name"`**: The top-level declaration. The name is a human-readable string.
- **`canonical`**: A unique, non-changeable string identifier for the agent. This is required.
- **`description`**: An optional string for internal documentation.
- **`llm`**: An object containing all configuration for the Language Model. This block is required.
- **`tools`**: A list of objects, where each object references a pre-configured tool by its name. See Section 5 for details.

---

## LLM Configuration (`llm` block)

The `llm` block defines the behavior of the AI model. It consists of common properties and a provider-specific configuration object.

### Common LLM Properties

These properties are required for all agent configurations, regardless of the AI provider.

```xs
llm = {
  type: "<provider_type>"
  system_prompt: "You are a helpful AI assistant..."
  max_steps: 5
  prompt: """
    User message: {{ $args.user_message }}
    User ID: {{ $args.user_id }}
    """
}
```

- **`type`** (string): Specifies the LLM provider.
  - Valid values: `xano-free`, `google-genai`, `openai`, `anthropic`.
- **`system_prompt`** (string): The foundational instructions for the agent. It defines its persona, goals, constraints, and how it should use tools.
- **`max_steps`** (integer): The maximum number of sequential LLM calls the agent can perform in a single run. This prevents infinite loops.

**Prompt or messages** (one of the following is required):

- `prompt` (string): A string containing the prompt. Use `"""` for multi-line strings.
- `messages` (string): An array of objects but JSON stringified; Instead of a single prompt string, you can define a series of messages to create a conversational context. Each message object must have a `role` (`system`, `user`, or `assistant`) and `content` (the message text). This is particularly useful for models that support chat-based interactions.

### Structured Outputs

Agents can be configured to return responses in a specific JSON format. This is defined within the `llm` block.

**Important Note:** When structured outputs are enabled, tool usage is disabled by the underlying model provider. So tools should not be added to an Agent with structured outputs enabled. Output follows similar rules as our [input](./input_guideline.md) are defined:

```xs
llm = {
  structured_outputs: true

  output {
    text description? filters=trim
    bool is_correct?
  }
}
```

## Provider-Specific Configurations

### Xano Test Model (`xano-free`)

A free, rate-limited model for testing and development, powered by Gemini. Ideal for new users.

- **Block name:** `xano_free`

| Parameter          | Type    | Description                                                 | Example |
| ------------------ | ------- | ----------------------------------------------------------- | ------- |
| `temperature`      | number  | Controls randomness. `0` is deterministic. `1` is creative. | `0.5`   |
| `search_grounding` | boolean | If `true`, enables Google Search grounding. Disables tools. | `false` |

```xs
agent "Xano Test Agent" {
  canonical = "x-test-123"
  llm = {
    type: "xano-free"
    system_prompt: "You are a test AI Agent. Respond clearly and concisely."
    max_steps: 3
    prompt: "{{ $args.message }}"
    temperature: 0
    search_grounding: false
  }
  tools = []
}
```

### Google Gemini (`google-genai`)

Configuration for Google's Gemini family of models.

- **Block name:** `google_genai`

| Parameter          | Type    | Description                                                                                                                 | Example                   |
| ------------------ | ------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `api_key`          | string  | Your Google Gemini API key. **Always use an environment variable.**                                                         | `"{{ $env.gemini_key }}"` |
| `model`            | string  | The specific Gemini model to use.                                                                                           | `"gemini-2.5-flash"`      |
| `temperature`      | number  | Controls randomness. `0.0` to `1.0`.                                                                                        | `0.7`                     |
| `search_grounding` | boolean | If `true`, grounds the model's response in Google Search results. **Disables tools.**                                       | `true`                    |
| `thinking_tokens`  | integer | The number of tokens the model can use for internal thinking before responding. Range `0` to `24576`. Use `-1` for dynamic. | `10000`                   |
| `include_thoughts` | boolean | If `true`, the model's internal reasoning or "thoughts" will be included in the response.                                   | `true`                    |
| `safety_settings`  | string  | JSON string for configuring safety thresholds. (See Google API docs).                                                       | `""`                      |
| `dynamic_retrival` | string  | Configuration for dynamic retrieval features. (See Google API docs).                                                        | `""`                      |

```xs
agent "Google Gemini Agent" {
  description = "An agent using Google Gemini 2.5 Flash."
  canonical = "ggl-gem-456"
  llm = {
    type: "google-genai"
    system_prompt: "You are a helpful AI Agent that uses its tools to find accurate information. Explain your reasoning."
    max_steps: 5
    prompt: "Fulfill this request for user {{ $args.user_id }}: {{ $args.user_message }}"
    api_key: "{{ $env.gemini_key }}"
    model: "gemini-2.5-flash"
    temperature: 0.2
    search_grounding: false
    thinking_tokens: 10000
    include_thoughts: true
  }
  tools = ["tool-get-user-info-abc", "tool-search-docs-def"]
}
```

### OpenAI (`openai`)

Configuration for OpenAI's GPT models. This can also be used for other OpenAI-compatible APIs by changing the `baseURL`.

- **Block name:** `openai`

> **Using OpenAI-Compatible Endpoints**
> The `baseURL` parameter can be overridden to use other providers like Groq, Mistral, OpenRouter, or X.AI.
>
> - **Groq:** `https://api.groq.com/openai/v1`
> - **Mistral:** `https://api.mistral.ai/v1`
> - **OpenRouter:** `https://openrouter.ai/api/v1`

| Parameter          | Type   | Description                                                                                        | Example                            |
| ------------------ | ------ | -------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `api_key`          | string | Your OpenAI API key. **Always use an environment variable.**                                       | `"{{ $env.openai_key }}"`          |
| `model`            | string | The specific OpenAI model to use.                                                                  | `"gpt-5-mini"`                     |
| `temperature`      | number | Controls randomness. `0.0` to `2.0`.                                                               | `1.0`                              |
| `reasoning_effort` | string | For reasoning models, sets how much effort is spent on thinking.                                   | `"low"`, `"medium"`, `"high"`      |
| `baseURL`          | string | Custom URL for API calls. Defaults to OpenAI. Leave blank for default.                             | `"https://api.groq.com/openai/v1"` |
| `organization`     | string | OpenAI organization ID.                                                                            | `""`                               |
| `project`          | string | OpenAI project ID.                                                                                 | `""`                               |
| `compatibility`    | string | Sets the API compatibility mode. `strict` or `compatible` use compaatible to allow other providers | `"strict"`                         |

```xs
agent "OpenAI Agent" {
  description = "A simple agent config for OpenAI models."
  canonical = "oai-gpt-789"
  llm = {
    type: "openai"
    system_prompt: "You are a helpful AI Agent that completes tasks accurately. Use your tools when necessary."
    max_steps: 3
    prompt: "Handle this request: {{ $args.user_message }}"
    api_key: "{{ $env.openai_key }}"
    model: "gpt-5-mini"
    temperature: 0.8
    reasoning_effort: "low"
    baseURL: ""
  }
  tools = []
}
```

### Anthropic (`anthropic`)

Configuration for Anthropic's Claude family of models.

- **Block name:** `anthropic`

| Parameter        | Type    | Description                                                                                          | Example                                                 |
| ---------------- | ------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `api_key`        | string  | Your Anthropic API key. **Always use an environment variable.**                                      | `"{{ $env.anthropic_key }}"`                            |
| `model`          | string  | The specific Claude model to use.                                                                    | `"claude-sonnet-4-5-20250929"`                          |
| `temperature`    | number  | Controls randomness. `0.0` to `1.0`.                                                                 | `0.5`                                                   |
| `send_reasoning` | boolean | If `true`, Claude creates `thinking` content blocks showing its reasoning before the final response. | `true`                                                  |
| `thinking`       | string  | JSON string to enable extended thinking and set a token budget. See Anthropic docs.                  | `"{ \"type\": \"enabled\", \"budget_tokens\": 10000 }"` |

```xs
agent "Anthropic Claude Agent" {
  description = "An agent powered by Claude 4.5 Sonnet."
  canonical = "ant-son-101"
  llm = {
    type         : "anthropic"
    system_prompt: "You are a thoughtful and careful AI assistant. You must use tools to verify facts before answering. Break down complex problems step-by-step."
    max_steps    : 8
    prompt       : """Please assist with the following task:
      {{ $args.task_description }}
      """
    api_key        : "{{ $env.anthropic_key }}"
    model          : "claude-sonnet-4-5-20250929"
    temperature    : 0.3
    send_reasoning : true
  }
  tools = ["tool-verify-facts-ghi"]
}
```

---

## Configuring Tools (`tools` block)

Tools are Xano functions that an agent can execute to interact with your database, call external APIs, or perform any defined action.

### Syntax

The `tools` property is a list of objects, where each object specifies a tool by its unique name.

```xs
agent "Customer Support Agent" {
  canonical = "support-agent-v2"
  llm = {

  }

  tools = [
    { name: "get_user_details_by_email" },
    { name: "cancel_subscription" },
    { name: "create_support_ticket" }
  ]
}
```

- **`{ name: "tool-name" }`**: Each tool is an object with a single `name` key. The value must be a string that exactly matches the name of a tool created in your Xano workspace.

### Runtime Behavior and Best Practices

!IMPORTANT: DO NOT DESCRIBE THE TOOLS IN THE `system_prompt` OR `prompt`. The agent automatically receives the tool descriptions and input schemas at runtime.

## Prompting and Dynamic Variables

Prompts are the primary way to provide runtime instructions to an agent. Xanoscript uses the **Twig** templating engine, allowing you to create dynamic, context-aware prompts allowing for variable substitution using `{{ $var.variable_name }}` syntax.

#### Runtime Arguments (`$args`)

`$args` are variables passed into the agent when it is called from a Xano function stack. This is the primary method for providing task-specific data.

- **Syntax**: `{{ $args.variable_name }}`
- **Use Case**: Passing user input, session IDs, or any other data unique to a specific agent run.

**Example:**

```xs
llm = {
  type: "openai"
  prompt: """
    {% if $args.user_input|length > 0 %}
      Generate a {{ $args.tone|capitalize }} response to the following request: "{{ $args.user_input|trim|escape }}".
      Ensure the response is concise, under {{ $args.max_length }} words, and includes relevant examples.
      {% if $args.tone == "professional" %}
        Use formal language and industry-specific terminology.
      {% elseif $args.tone == "casual" %}
        Use conversational language and relatable analogies.
      {% else %}
        Adapt tone to context, maintaining clarity.
      {% endif %}
      Format the output as a JSON object with "prompt" and "timestamp" fields, where timestamp is "{{ "now"|date("Y-m-d H:i:s") }}".
    {% else %}
      Error: No input provided, ask the user to provide input.
    {% endif %}
    """
  api_key: "{{ $env.openai_key }}"
  model: "gpt-5-mini"
  temperature: 0.7
  reasoning_effort: "medium"
  max_steps: 4
}
```

Note the use of `{{ $env.openai_key }}` in the api_key field, `$env` variables are useful to securely pass API keys and other secrets to the agent but should be avoided in prompts and system prompts to prevent accidental exposure.

### Prompting Best Practices

1.  **Be Clear and Specific**: Write prompts that clearly define the agent's goal for the specific task. The `system_prompt` sets the overall persona and role, while the `prompt` gives the immediate task.
2.  **Provide Rich Context**: Use `$args` to give the agent all the context it needs. The more relevant information it has (like user history, account status, etc.), the better its decisions will be.
3.  **Use Multi-line Strings for Readability**: Use triple quotes (`"""`) to structure larger prompts cleanly, separating instructions from dynamic data.
4.  **Keep Logic Minimal**: Although Twig supports logic (e.g., `{% if %}`, `{% for %}`), it should be used sparingly within prompts. The agent's core strength is its own reasoning ability. Overly complex templating can be brittle and hard to debug. Leave the decision-making to the LLM.
    - **Acceptable Use of Logic:** Conditionally providing a piece of information.
      ```twig
      {% if $args.is_priority_customer %}
      This is a priority customer. Respond within 5 minutes.
      {% endif %}
      ```
5.  **Do Not Repeat Tool Instructions**: As stated above, there is no need to repeat the tool instructions in the prompt. The system handles this automatically. Focus the prompt on the _what_, _why_ and _when_, and let the agent figure out the _how_ by using its tools.


# Agent Examples

Real-world examples of AI agent configurations for various use cases and automation scenarios.

## Xano Test Agent

A free, rate-limited model for testing and development, powered by our included `xano-free` model which runs on Google Gemini. Ideal for new users.

```xs
agent "Xano Test Agent" {
  canonical = "x-test-123"
  llm = {
    type         : "xano-free"
    system_prompt: "You are a test AI Agent. Respond clearly and concisely."
    prompt       : "{{ $args.message }}"
    max_steps    : 3
    temperature     : 0
    search_grounding: false
  }
  tools = []
}
```

## Google Gemini Agent

An agent using Google Gemini 1.5 Flash

```xs
agent "Google Gemini Agent" {
  description = "An agent using Google Gemini 1.5 Flash."
  canonical = "ggl-gem-456"
  llm = {
    type         : "google-genai"
    system_prompt: "You are a helpful AI Agent that uses its tools to find accurate information. Explain your reasoning."
    max_steps    : 5
    prompt       : "Fulfill this request for user {{ $args.user_id }}: {{ $args.user_message }}"
    api_key         : "{{ $env.gemini_key }}"
    model           : "gemini-1.5-flash"
    temperature     : 0.2
    search_grounding: false
    thinking_tokens : 8000
    include_thoughts: true
  }
  tools = [
    "tool-get-user-info-abc",
    "tool-search-docs-def"
  ]
}
```

## OpenAI Agent

A simple agent config for OpenAI models.

```xs
agent "OpenAI Agent" {
  description = "A simple agent config for OpenAI models."
  canonical = "oai-gpt-789"
  llm = {
    type         : "openai"
    system_prompt: "You are a helpful AI Agent that completes tasks accurately. Use your tools when necessary."
    max_steps    : 3
    prompt       : "Handle this request: {{ $args.user_message }}"

    api_key         : "{{ $env.openai_key }}"
    model           : "gpt-4o"
    temperature     : 0.8
    reasoning_effort: "low"
    baseURL         : ""
  }
  tools = []
}
```

## Anthropic Claude Agent

An agent powered by Claude 3.5 Sonnet.

```xs
agent "Anthropic Claude Agent" {
  description = "An agent powered by Claude 3.5 Sonnet."
  canonical = "ant-son-101"
  llm = {
    type         : "anthropic"
    system_prompt: "You are a thoughtful and careful AI assistant. You must use tools to verify facts before answering. Break down complex problems step-by-step."
    max_steps    : 8
    prompt       : """
      Please assist with the following task:
      {{ $args.task_description }}
      """
    api_key        : "{{ $env.anthropic_key }}"
    model          : "claude-3-5-sonnet-20240620"
    temperature    : 0.3
    send_reasoning : true
  }
  tools = ["tool-verify-facts-ghi"]
}
```

## Customer Support Agent with Tools

This agent is configured to use a set of tools to help with customer support tasks.

```xs
agent "Customer Support Agent" {
  canonical = "support-agent-v2"
  llm = {
    type         : "openai"
    system_prompt: "You are a customer support agent. Use your tools to find customer information and resolve their issues."
    max_steps    : 5
    prompt       : "The customer with email {{ $args.email }} has the following issue: {{ $args.issue }}"
    api_key         : "{{ $env.openai_key }}"
    model           : "gpt-4o"
    temperature     : 0.5
  }

  tools = [
    { name: "get_user_details_by_email" },
    { name: "cancel_subscription" },
    { name: "create_support_ticket" }
  ]
}
```


# MCP Server Guidelines

How to create Model Context Protocol (MCP) servers that expose tools and resources to AI agents.

## Core MCP Server Syntax

Every MCP server is defined within an `mcp_server` block.

```xs
mcp_server "MCP Server Display Name" {
  canonical = "unique-server-id"
  description = "A brief explanation of what this server is for."
  instructions = "These instructions apply server-wide and guide the AI on how to use the collection of tools."
  tags = ["tag1", "tag2"]
  tools = [
    { name: "tool-name-1" },
    { name: "tool-name-2" }
  ]
  history = "inherit"
}
```

- **`mcp_server "Name"`**: The top-level declaration. The name is a human-readable string.
- **`canonical`**: A required unique, non-changeable string identifier for the server.
- **`description`**: An optional string for internal documentation. This is not broadcast with the server.
- **`instructions`**: A string containing general guidelines for AI agents about the server's overall purpose and usage context.
- **`tags`**: An optional list of strings for categorizing and organizing your servers.
- **`tools`**: A required list of objects, where each object references an AI Tool by its unique name.

## Tools Block

The `tools` block is a list that specifies the tools exposed by the MCP server:

```xs
tools = [
  { name: "get_user_details_by_email" },
  { name: "cancel_subscription" },
  { name: "create_support_ticket" }
]
```

The value of the `name` key must be an exact match the unique name of a tool defined in your `tools/` directory, see [Tool Guideline](./tool_guideline.md) for more information.

## Best Practices

- **Use a Clear Naming Convention**: Give your servers a descriptive name and a memorable canonical ID.
- **Write Comprehensive Instructions**: The server-level `instructions` should provide a high-level overview of what the collection of tools can accomplish. For example, "A set of tools for managing customer support tickets, including creating, updating, and closing tickets."
- **Group Related Tools**: Create logical groupings of tools within a single MCP server. For instance, a `user-management-server` could contain tools for creating, updating, and deleting users.
- **Use Tags for Organization**: Use tags to categorize your servers, making them easier to manage in a large project.


# MCP Server Examples

Example MCP server implementations with various tool configurations and capabilities.

## MCP Server with Tools

This example shows a basic MCP server configuration that exposes two tools.

```xs
mcp_server "My Mcp Server" {
  description = "An example MCP server."
  canonical = "u3D7kj5Q"
  instructions = "General guidelines for AI agents about this server's overall purpose and usage context. These instructions apply server-wide and are separate from individual tool descriptions and parameters."
  tags = ["sample_tag"]
  tools = [
    { name: "new_statements" },
    { name: "what_is_xano" }
  ]
  history = "inherit"
}
```

## MCP Server without Tools

This example shows an MCP server that does not yet have any tools configured.

```xs
mcp_server "Empty Mcp Server" {
  description = "An MCP server with no tools yet."
  canonical = "a1B2c3D4"
  instructions = "This server is currently under development and does not yet have any tools available."
  tags = ["development"]
  tools = []
  history = "inherit"
}
```


# Tool Guidelines

How to define custom tools that agents can use to perform specific actions and operations.

## How to Define AI Tools in XanoScript

Tools are defined in `<tool_name>.xs` files within the `tools/` directory of your project, they follow the same syntax as standard Xano [function stacks](./function_guideline.md) with some additional features tailored for AI interactions.

For example, you might have a file named `tools/user_lookup.xs` that contains the definition of a tool for looking up user information:

````xs
tool "user_lookup" {
  description = "Looks up user information by user ID."
  instructions = "Use this tool to retrieve detailed information about a user given their unique user ID. Provide the user ID as input, and the tool will return the user's profile data."
  input {
    int user_id {
      description = "The unique identifier of the user to look up."
    }
  }
  stack {
    db.get "user" {
      field_name = "id"
      field_value = $input.user_id
      description = "Verify user exists"
    } as $user
  }

  response = $user
}

## Core Tool Syntax

Every tool is defined within a `tool` block.

```xs
tool "unique_tool_name" {
  description = "A brief explanation of what this tool does."
  instructions = "Guidelines explaining how AI agents should use this tool, including use cases, input formatting, and output interpretation."
  input {

  }
  stack {

  }
  response = null
  history = false
}
````

### Key Fields

- **`tool "name"`**: The top-level declaration. The name must be a unique string identifier, as this is how the tool is referenced by Agents and MCP servers.
- **`description`**: An optional string for internal documentation. This is not visible to the AI.
- **`instructions`**: A required string that provides the AI with the context it needs to use the tool effectively. This is a crucial field for ensuring the tool is used correctly by the agent.
- **`input`**: An object defining the parameters the tool accepts.
- **`stack`**: An object containing the sequence of operations to be executed.
- **`response`**: An object that specifies the data returned by the tool.

---

## Input Block

The `input` block defines the parameters that the tool can accept at runtime. The structure is identical to inputs in other Xano function stacks, but the `description` for each parameter is especially important, as it is included in the information sent to the AI.

### Input Structure

The `input` block accepts a series of field definitions, follow the [input guidleine](./input_guideline.md) for more details

## Stack Block and Tool-Specific Statements

The `stack` contains the tool's logic. In addition to all standard Xano function statements, tools have access to three unique statements for calling other Xano resources.

### 1. `api.call`

Executes an API endpoint from one of your API groups. This is the preferred way to interact with your backend from a tool, as it ensures that all business logic encapsulated in the API is respected.

```xs
stack {
  api.call "auth/login" verb=POST {
    api_group = "Authentication"
    input = {
      email: "user@example.com",
      password: "password123"
    }
  } as $login_response
}
```

### 2. `task.call`

Executes a background task. Tasks do not accept inputs or return outputs directly.

```xs
stack {
  task.call "my_background_task" as $task_call_result
}
```

### 3. `tool.call`

```xs
stack {
  tool.call "get_user_details" {
    input = {user_id: 123}
  } as $user_details
}
```

Executes another AI Tool. This allows you to create modular, reusable tools that can be composed together.

- **Syntax**: `tool.call <tool_name> { ... }`

```xs
stack {
  tool.call "get_user_details" {
    input = {user_id: 123}
  } as $user_details
}
```

## Response Block

The `response` block specifies the data that the tool returns to the agent or client that called it. The structure is the same as in other Xano function stacks.

**Example:**

```xs
response = $user_details
```

## Best Practices

- **Write Clear Instructions**: The `instructions` field is the most important part of your tool's definition. Be explicit about what the tool does, what each input parameter is for, and what the output means.
- **Use Descriptive Input Fields**: Clearly describe each input parameter. This information is passed to the AI and helps it construct valid requests.
- **Leverage Enums**: For inputs with a fixed set of possible values, use an `enum` type. This provides the AI with the exact options it can use, reducing errors.
- **Keep Tools Focused**: Design tools that perform a single, well-defined task. This makes them easier for the AI to understand and combine.
- **Handle Errors Gracefully**: Use `filters` on input, `precondition` and `try_catch` blocks in the stack to validate inputs and handle potential errors. Return clear error messages in the response so the AI can understand what went wrong.


# Tool Examples

Real-world examples of custom tools for database operations, API integrations, and more.

## Tool with API, Task, and Tool Calls

This example demonstrates a tool that utilizes all three tool-specific statements: `api.call`, `task.call`, and `tool.call`.

```xs
tool "new_statements" {
  description = "A tool that demonstrates calling other Xano resources."

  instructions = "This tool is used to test the functionality of calling APIs, tasks, and other tools from within a tool. It takes a user's name as input and returns the result of an API call."

  input {
    text name? filters=trim {
      description = "The name of the user to be used in the various calls. Descriptions are important as they are sent to the AI."
    }
  }

  stack {
    api.call "auth/login" verb=POST {
      api_group = "Authentication"
      input = {email: "email@email.com", password: "password"}
    } as $endpoint1

    task.call "task_example" as $test1

    tool.call "what_is_xano" {
      input = {query: "What is Xano?"}
    } as $tool1
  }

  response = $endpoint1

  history = "inherit"
}
```

## Simple Information Retrieval Tool

This is an example of a simple tool that retrieves information.

```xs
tool "what_is_xano" {
  description = "Provides a brief description of Xano."
  instructions = "Use this tool to get a basic explanation of what Xano is."

  input {
    text query? {
      description = "A question about Xano. The content of the query is ignored, the tool always returns the same text."
    }
  }

  stack {
    var $xano_description {
      value = "Xano is a no-code backend platform that allows you to build scalable, secure, and compliant backends without writing any code."
    }
  }

  response = $xano_description

  history = 100
}
```


# XanoScript Statements

Complete reference for all XanoScript language constructs used in agent tools and MCP servers.

# stack

```xs
stack {
  var $counter {
    value = 0
  }
  for (3) {
    each as $index {
      math.add $counter {
        value = 1
      }
    }
  }
  debug.log {
    value = $counter
  }
}
```

A `stack` block defines a sequence of actions to be executed in a specific context, such as within a `query`, `function`, `task`, or other block (e.g., `group`, `transaction`). It acts as a container for operations like:

- Variable declarations (e.g., `var`),
- Control flow (e.g., `for`, `conditional`),
- Function calls (e.g., `math.add`, `debug.log`),
- Database operations (e.g., `db.query`).

Stacks are used to organize and execute a series of steps in a structured manner, often as part of a larger workflow.

# input

```xs
input {
  text username filters=trim {
    description = "User's login name"
    sensitive = false
  }
  int age? {
    description = "User's age (optional)"
  }
}
```

An `input` block defines the parameters expected by a `query` or `function`. It includes:

- Fields with their data types (e.g., `text`, `int`),
- Optional status (marked with `?`),
- Filters (e.g., `trim`) to process the input,
- Metadata like `description` for clarity or `sensitive` to mark private data.

here is the list of accepted types:

- int
- timestamp
- text
- uuid
- vector
- date
- bool
- decimal
- email
- password
- json
- image
- video
- audio
- attachment

Inputs specify the data that a query or function can receive and work with, such as user-provided values in an API request.

# schema

```xs
schema {
  int customer_id
  text full_name filters=trim {
    description = "Customer's full name"
  }
  email contact_email filters=trim|lower {
    description = "Customer's email address"
    sensitive = true
  }
  timestamp registered_at?=now
}
```

A `schema` block, used within a `table` file, defines the structure of a database table. It includes:

- Fields with their data types (e.g., `int`, `text`, `email`),
- Optional status (marked with `?`),
- Default values (e.g., `?=now`),
- Filters (e.g., `trim|lower`) to process field values,
- Metadata like `description` for clarity or `sensitive` to mark private fields.

Schemas outline the columns and their properties for storing data in a table.

# response

```xs
response = $user_data
```

A `response` block, used within a `query` or `function`, specifies the data to return as the result of the operation. The value parameter defines the output, which can be a variable (e.g., `$user_data`), a literal, or an expression. Responses determine what data is sent back to the caller, such as API response data or a function’s return value.

# schedule

```xs
schedule {
  events = [
    {starts_on: 2025-01-01 09:00:00+0000, freq: 86400},
    {starts_on: 2025-01-02 09:00:00+0000, freq: 604800, ends_on: 2025-12-31 09:00:00+0000}
  ]
}
```

A `schedule` block, used within a `task` file, defines when the task should run. It includes an `events` array with:

- `starts_on`: The start date and time (e.g., `2025-01-01 09:00:00+0000`),
- `freq`: The frequency in seconds for recurring tasks (e.g., `86400` for daily, `604800` for weekly),
- `ends_on`: An optional end date for recurring tasks (e.g., `2025-12-31 09:00:00+0000`).

Schedules automate task execution at specified intervals or times.

# table

```xs
table "customer" {
  auth = true
  schema {
    int id
    text name filters=trim {
      description = "Customer's full name"
    }
    email email filters=trim|lower {
      description = "Customer's email address"
      sensitive = true
    }
    timestamp signup_date?=now
    bool is_active?=true
  }
  index = [
    {type: "primary", field: [{name: "id"}]}
    {type: "gin", field: [{name: "xdo", op: "jsonb_path_op"}]}
    {type: "btree", field: [{name: "email", op: "desc"}]}
  ]
}
```

A `table` file defines the schema for a database table (e.g., `customer`). It includes:

- An `auth` flag to enable/disable authentication for the table,
- A `schema` block listing fields with their data types (e.g., `int`, `text`, `email`), optional status (marked with `?`), default values (e.g., `?=now`), filters (e.g., `trim|lower`), and metadata like `description` or `sensitive`,
- An `index` block defining indexes for efficient querying (e.g., `primary` for the `id` field, `unique` for the `email` field).

Tables are used to structure and store data in a database, such as customer information.

# query

```xs
query /products verb=GET {
  input {
    text category filters=trim {
      description = "Product category to filter by"
      sensitive = false
    }
  }
  stack {
    var $category_filter {
      value = $input.category
    }
    conditional {
      if (`$category_filter|strlen > 0`) {
        db.query "product" {
          where = ($db.product.category|to_lower) == ($category_filter|to_lower)
        } as $filtered_products
      }
      else {
        db.query "product" {
        } as $filtered_products
      }
    }
  }
  response = $filtered_products
}
```

A `query` file defines an API endpoint to handle HTTP requests (e.g., GET, POST). It includes:

- A path (e.g., `/products`) and HTTP method (`verb`),
- An `input` block to define request parameters (e.g., `category`), which can have filters (e.g., `trim`) and metadata like `description` or `sensitive`,
- A `stack` block containing the logic to process the request (e.g., querying a database, applying conditions),
- A `response` block specifying the data to return (e.g., `$filtered_products`).

Queries are essential for creating API endpoints to retrieve or manipulate data, such as fetching products by category.

# function

```xs
function "calculate_total" {
  input {
    int quantity?
    int price_per_item?
  }
  stack {
    var $total {
      value = 0
    }
    conditional {
      if (`$input.quantity == null || $input.price_per_item == null`) {
        throw {
          name = "InvalidInputError"
          value = "Quantity and price must be provided"
        }
      }
      else {
        math.mul $total {
          value = $input.quantity
        }
        math.mul $total {
          value = $input.price_per_item
        }
      }
    }
  }
  response = $total
}
```

A `function` file defines a reusable custom function that can be called elsewhere in your script. It includes:

- A name (e.g., `"calculate_total"`) to identify the function,
- An `input` block to define parameters (e.g., `quantity` and `price_per_item`), which can be optional (marked with `?`),
- A `stack` block containing the logic to execute (e.g., calculations, conditionals),
- A `response` block specifying the return value (e.g., `$total`).

Functions are ideal for encapsulating logic, such as calculating a total cost, that can be reused across scripts.

# task

```xs
task "daily_report" {
  stack {
    db.query "sales" {
      description = "Fetch daily sales data"
    } as $daily_sales
  }
  schedule = [
    {starts_on: 2025-01-01 08:00:00+0000, freq: 86400}
  ]
}
```

A `task` file defines a scheduled job that runs automatically at specified times. It includes:

- A name (e.g., `"daily_report"`) to identify the task,
- A `stack` block containing the actions to execute (e.g., querying a database),
- A `schedule` block with `events` to define when the task runs, including:
  - `starts_on`: The start date and time (e.g., `2025-01-01 08:00:00+0000`),
  - `freq`: The frequency in seconds for recurring tasks (e.g., `86400` for daily),
  - `ends_on`: An optional end date for recurring tasks (not used here).

Tasks are ideal for automating recurring operations like generating reports or syncing data.

# api.lambda

```xs
api.lambda {
  code = """
    // Javascript or Typescript code goes here
    return $input.value > 10 ? true : false;
  timeout = 10
  """
} as $result
```

allows you to run provided `code` in Javascript or Typescript in a sandboxed environment. Maximum execution time is `timeout` seconds.

The lambda function has access to your function stack context like `$input`, `$var`, `$auth` and `$env`.

The result of the execution is stored in `as $result` variable and is the returned value of the code.

# api.request

```xs
api.request {
  url = "https://api.example.com/users"
  method = "GET"
  params = {}|set:"user_id":"123"
  headers = []|push:"Authorization: Bearer token123"
  timeout = 30
} as $user_response
```

Sends an HTTP request to a specified URL and retrieves the response. It supports various HTTP methods, query parameters, custom headers, and a timeout to limit execution time. The response is stored in the variable specified by `as`.

# api.stream

```xs
api.stream {
  value = $processed_results
}
```

Streams data back to the client when the API response type is set to `'Stream'`. This is useful for real-time data delivery, such as in live updates or large data transfers.

# api.realtime_event

```xs
api.realtime_event {
  channel = "notifications_channel"
  data = $alert_message
  auth_table = "users"
  auth_id = "user_789"
}
```

Sends a real-time event over a specified channel, enabling live updates in applications. It includes a data payload and optional authentication details to control access.

# var

```xs
var $name {
  value = "value"
}
```

defines a variable with the name `$name` and the value `"value"`. The value can be a string, number, boolean, or an object followed by filters.

# var.update

```xs
var.update $name {
  value = "value"
}
```

updates the value of the variable with the name `$name` to `"value"`. The value can be a string, number, boolean, or an object followed by filters.

# array.find

```xs
array.find $customer_ages if (`$this > 18`) as $first_adult_age
```

Searches an array and returns the first element that meets the specified condition. If no element satisfies it, `null` is returned. The result is stored in the variable defined by `as`.

# array.push

```xs
array.push $shopping_cart {
  value = "oranges"
  disabled = false
  description = "Add oranges to cart"
}
```

Appends a new element to the end of an array. It accepts a `value` to add, with optional `disabled` (to skip execution) and `description` (for context or logging).

# array.unshift

```xs
array.unshift $priority_tasks {
  value = "urgent meeting"
}
```

Inserts a new element at the beginning of an array, shifting existing elements to higher indexes.

# array.shift

```xs
array.shift $waiting_list as $next_customer
```

Removes and returns the first element of an array, shortening the array by one. The removed element is stored in the variable specified by `as`.

# array.pop

```xs
array.pop $completed_tasks as $last_finished_task
```

Removes and returns the last element of an array, reducing its length by one. The removed element is stored in the variable defined by `as`.

# array.merge

```xs
array.merge $active_users {
  value = $new_users
}
```

Combines another array or a single value into the target array, appending all elements from the provided `value`.

# array.map

```xs
array.map ($json) {
  by = $this.email
} as $emails

array.map ($json) {
  by = {name: $this.name, gender: $this.gender}
} as $people
```

Transforms each element in an array using a specified expression defined in `by`. The resulting array is stored in the variable specified by `as`.

# array.partition

```xs
array.partition ($json) if ($this.gender == "male") as $is_male
```

Divides an array into two separate arrays based on a condition and stores the results in an object with a `true` and `false` key.

results look like:

```json
{
  "true": [
    /* elements matching condition */
  ],
  "false": [
    /* elements not matching condition */
  ]
}
```

# array.group_by

```xs
array.group_by ($users) {
  by = $this.gender
} as $user_by_gender
```

Groups elements in an array based on a specified key or expression defined in `by`.

# array.union

```xs
// expects the result to be [1,2,3,4,5,6,7,8,9]
array.union ([1,3,5,7,9]) {
  value = [2,4,6,8]
  by = $this
} as $union
```

Combines two arrays into one, removing duplicate elements based on the expression defined in `by`.

# array.difference

```xs
// expects the result to be [1,3,5,7,9]
array.difference ([1,2,3,4,5,6,7,8,9]) {
  value = [2,4,6,8]
  by = $this
} as $difference
```

Creates a new array containing elements from the original array that are not present in the provided `value` array, based on the expression defined in `by`.

# array.intersection

```xs
// expects the result to be [2,4,6]
array.intersection ([1,2,3,4,5,6,7]) {
  value = [2,4,6,8]
  by = $this
} as $intersection
```

Generates a new array containing only the elements that exist in both the original array and the provided `value` array, based on the expression defined in `by`.

# array.find_index

```xs
array.find_index $sale_prices if (`$this < 20`) as $first_discount_index
```

Returns the index of the first element that satisfies the condition. If no match is found, it returns `-1`. The result is stored in the variable specified by `as`.

# array.has

```xs
array.has $team_roles if (`$this == "manager"`) {
  disabled = false
  description = "Verify manager role"
} as $has_manager
```

Checks if at least one element in the array meets the condition, returning `true` if so, `false` otherwise. The result is stored in the `as` variable. Optional `disabled` and `description` parameters control execution and add context.

# array.every

```xs
array.every $exam_scores if (`$this >= 70`) as $all_passed
```

Tests whether every element in the array satisfies the condition, returning `true` if they all do, `false` if any fail. The result is stored in the `as` variable.

# array.filter

```xs
array.filter $temperatures if (`$this > 32`) as $above_freezing
```

Creates a new array containing only the elements that meet the condition. The filtered result is stored in the variable specified by `as`.

# array.filter_count

```xs
array.filter_count $survey_responses if (`$this == "yes"`) as $yes_count
```

Counts how many elements in the array satisfy the condition. The total is stored in the variable defined by `as`.

Below is the documentation for the XanoScript functions related to database operations and control flow, as requested in your query. Each entry follows the style of the existing documentation, providing a code snippet example and a brief explanation of what the function does. The examples use meaningful variable names to illustrate practical use cases.

# conditional

```xs
conditional {
  if (`$user_age > 18`) {
    debug.log {
      value = "Adult user"
    }
  }
  elseif (`$user_age < 18`) {
    debug.log {
      value = "Minor user"
    }
  }
  else {
    debug.log {
      value = "User age not specified"
    }
  }
}
```

Controls the flow of the script based on specified conditions, allowing different code blocks to execute depending on whether the conditions are true or false. It functions like an if-else statement, checking each condition in sequence and running the corresponding block.

# continue

```xs
foreach $users as $user {
  if (`$user.age < 18`) {
    continue
  }
  debug.log {
    value = `$user.name + " is an adult"`
  }
}
```

Skips the current iteration of a loop and moves to the next one. This is useful for bypassing specific items in a loop based on a condition, such as skipping users under 18 in this example.

# db.add

```xs
db.add user {
  data = {
    name: $input.name,
    email: $input.email
  }
} as $new_user
```

Inserts a new record into a specified database table (e.g., `user`) with the provided data fields. The new record is stored in the variable specified by `as`, here `$new_user`, for further use.

# db.add_or_edit

```xs
db.add_or_edit user {
  field_name = "email"
  field_value = $input.email
  data = {
    name: $input.name,
    category: $input.category
  }
} as $user_record
```

Adds a new record to a database table (e.g., `user`) or updates an existing one based on a specified field (e.g., `email`) and its value (e.g., `$input.email`). The data block specifies the fields to add or update, and the resulting record is stored in `$user_record`.

# db.del

```xs
db.del comment {
  field_name = "id"
  field_value = $input.commentId
}
```

Removes a record from a database table (e.g., `comment`) based on a specified field (e.g., `id`) and its value (e.g., `$input.commentId`). This deletes the matching record.

# db.direct_query

```xs
db.direct_query {
  sql = "SELECT * FROM users WHERE users.email = ?"
  response_type = "list"
  arg = $input.email
} as $query_results
```

Executes a raw SQL query directly on the database, using placeholders (`?`) for parameters provided via `arg`. The `response_type` specifies whether to return a `list` or `single` result. The output is stored in the variable defined by `as`, here `$query_results`.

# db.edit

```xs
db.edit "user" {
  field_name = "email"
  field_value = $input.email
  data = {
    category: $input.category
  }
} as $updated_user
```

Updates an existing record in a database table (e.g., `user`) identified by a field (e.g., `email`) and its value (e.g., `$input.email`). The `data` block specifies the fields to update, and the revised record is stored in `$updated_user`.

# db.get

```xs
db.get "user" {
  field_name = "email"
  field_value = $input.email
} as $user
```

Retrieves a single record from a database table (e.g., `user`) based on a specified field (e.g., `email`) and its value (e.g., `$input.email`). The fetched record is stored in the variable specified by `as`, here `$user`.

# db.has

```xs
db.has "user" {
  field_name = "email"
  field_value = $input.email
} as $user_exists
```

Checks if a record exists in a database table (e.g., `user`) based on a specified field (e.g., `email`) and its value (e.g., `$input.email`). Returns `true` if found, `false` otherwise, stored in `$user_exists`.

# db.query

```xs
db.query "client" {
  description = "Fetch client details by name"
  where = $db.client.name contains $input.search
  sort = {name: "asc"}
  return = {
    type: "list"
    paging: {
      page: 1
      per_page: 25
    }
  }
} as $matched_client
```

The search variables accepts specific query filters, listed in the [Query Filters documentation](./query_filters.md).

Retrieves multiple records from a database table (e.g., `client`) based on a search condition. Here, it matches records where the client name contains the search input. The results are sorted by name in ascending order and include pagination. The results are stored in `$matched_client`.

```xs
db.query "availability" {
  sort = {created_at: "asc"}
  return = {
    type: "list"
    paging: {
      page: $input.page
      per_page: 20
    }
  }
} as $availability
```

Retrieves multiple records from a database table (e.g., `availability`) with sorting by creation date. The results include pagination using dynamic values from input parameters. The results are stored in `$availability`.

# db.schema

```xs
db.schema user {
  path = "email"
} as $email_schema
```

Returns the schema of a database table (e.g., `user`) or a specific field within it (e.g., `email` via `path`). The schema information is stored in the variable specified by `as`, here `$email_schema`.

# db.set_datasource

```xs
db.set_datasource {
  value = "test"
}
```

Changes the datasource for all subsequent database queries in the current script execution to the specified value (e.g., `"test"`). This affects all database operations that follow.

# db.transaction

```xs
db.transaction {
  description = "Update user and log action"
  stack {
    db.update user { /* ... */ }
    db.add log { /* ... */ }
  }
}
```

Executes a series of database operations (e.g., updating a user and adding a log entry) within a single transaction. Ensures atomicity—either all operations succeed, or none are applied. The `description` provides context.

# db.truncate

```xs
db.truncate user {
  reset = true
}
```

Deletes all records from a specified database table (e.g., `user`). If `reset = true`, it also resets any auto-incrementing IDs, effectively clearing the table and starting fresh.

# db.external.mssql.direct_query

```xs
db.external.mssql.direct_query {
  sql = "SELECT * FROM orders WHERE orders.total > ?"
  response_type = "list"
  connection_string = "mssql://db_user:db_password@server.com:1433/sales_db?sslmode=disabled"
  arg = $input.min_total
} as $large_orders
```

Executes a SQL query directly on an external Microsoft SQL Server database. The `code` parameter contains the SQL statement, and `response_type` specifies whether it returns a `list` of records or a `single` record. The `connection_string` provides access to the database, and `arg` supplies values for placeholders (e.g., `?`) in the query. Results are stored in the variable defined by `as`, here `$large_orders`.

# db.external.mysql.direct_query

```xs
db.external.mysql.direct_query {
  sql = "SELECT * FROM products WHERE products.category = ?"
  response_type = "list"
  connection_string = "mysql://db_user:db_password@host.com:3306/inventory_db?sslmode=disabled"
  arg = $input.category
} as $category_products
```

Runs a SQL query directly on an external MySQL database. The `response_type` determines if the result is a `list` or a `single` record. The `connection_string` specifies the database connection, and `arg` provides values for query placeholders. The output is stored in the `as` variable, here `$category_products`.

# db.external.oracle.direct_query

```xs
db.external.oracle.direct_query {
  sql = "SELECT * FROM employees WHERE employees.department = ?"
  response_type = "list"
  connection_string = "oracle://db_user:db_password@server.com:1521/hr_db"
  arg = $input.department
} as $department_employees
```

Directly executes a SQL query on an external Oracle database. The `response_type` sets whether the query returns a `list` or a `single` record. The `connection_string` defines the database connection, and `arg` supplies placeholder values. Results are stored in the variable specified by `as`, here `$department_employees`.

# db.external.postgres.direct_query

```xs
db.external.postgres.direct_query {
  sql = "SELECT * FROM customers WHERE customers.last_purchase > ?"
  response_type = "list"
  connection_string = "postgres://db_user:db_password@host.com:5432/shop_db?sslmode=prefer"
  arg = $input.date_threshold
} as $recent_customers
```

Performs a SQL query directly on an external PostgreSQL database. The `response_type` indicates if the result is a `list` or a `single` record. The `connection_string` establishes the database connection, and `arg` provides values for placeholders. The results are stored in the `as` variable, here `$recent_customers`.

# debug.stop

```xs
debug.stop {
  value = $some_var
}
```

This function stops the script’s execution at the point where it’s called and sends the specified `value` to the debugger. It’s a handy tool for troubleshooting, allowing you to inspect the contents of a variable (like `$some_var`) during development to ensure your script is working as expected.

# foreach

```xs
foreach ($numbers_list) {
  each as $item {
    var.update $sum {
      value = `$sum + $item`
    }
  }
}
```

**Example with a predefined list**:

```xs
foreach ([1, 2, 3, 4]) {
  each as $item {
    var.update $sum {
      value = `$sum + $item`
    }
  }
}
```

The `foreach` function loops through every item in a list (e.g., an array like `$numbers_list` or `[1, 2, 3, 4]`). The `each as` clause assigns the current item to a variable (e.g., `$item`), which you can use inside the loop to perform actions on each element.

# for

```xs
for (10) {
  description = "Repeat this 10 times, with $index counting from 0 to 9"
  each as $index {
    debug.log {
      value = `$index + 1`
    }
  }
}
```

This function creates a loop that runs a set number of times (e.g., 10). The `each as` clause provides a counter variable (e.g., `$index`), which starts at 0 and increases by 1 each iteration, up to one less than the specified number (e.g., 0 through 9 for a count of 10).

# function.run

```xs
function.run "add_fn" {
  input = { a: $input.a, b: $input.b }
} as $func_result
```

The `function.run` function calls a custom function (e.g., `add_fn`) and passes it the data specified in the `input` parameter (e.g., an object with `a` and `b` values). The result of the function is stored in the variable named after `as` (e.g., `$func_result`), making it available for further use in your script.

# group

```xs
group {
  description = "your group description"
  stack {
    debug.log {
      value = "Action 1"
    }
  }
}
```

The `group` function organizes a set of actions into a logical block that can be collapsed in the user interface for better readability. The `description` field labels the group (e.g., "group description"), and the `stack` contains the actions you want to group together.

# math.sub

```xs
math.sub $total_cost {
  value = $discount_amount
}
```

Subtracts the specified `value` (e.g., `$discount_amount`) from the variable (e.g., `$total_cost`) and updates the variable with the result. This is ideal for scenarios like reducing a total by a discount.

**NOTE**: math.sub does not return a value; it mutates the variable directly.

# math.mul

```xs
math.mul $base_price {
  value = $tax_rate
}
```

Multiplies the variable (e.g., `$base_price`) by the specified `value` (e.g., `$tax_rate`) and stores the product back into the variable. Use this to calculate values like a price with tax applied.

**NOTE**: math.mul does not return a value; it mutates the variable directly.

# math.div

```xs
math.div $total_time {
  value = $num_tasks
}
```

Divides the variable (e.g., `$total_time`) by the specified `value` (e.g., `$num_tasks`), updating the variable with the quotient. This is useful for finding averages, such as time per task.

**NOTE**: math.div mutates the value, it doesn't have a return value.

# math.bitwise.xor

```xs
math.bitwise.xor $flags {
  value = $toggle_bit
}
```

Performs a bitwise XOR operation between the variable (e.g., `$flags`) and the specified `value` (e.g., `$toggle_bit`), storing the result in the variable. This is handy for toggling specific bits in a binary flag.

**NOTE**: math.bitwise.xor mutates the value, it doesn't have a return value.

# math.bitwise.or

```xs
math.bitwise.or $permissions {
  value = $new_permission
}
```

Applies a bitwise OR operation between the variable (e.g., `$permissions`) and the specified `value` (e.g., `$new_permission`), updating the variable with the result. Commonly used to add permissions to an existing set.

**NOTE**: math.bitwise.or mutates the value, it doesn't have a return value.

# math.bitwise.and

```xs
math.bitwise.and $status_flags {
  value = $check_bit
}
```

Executes a bitwise AND operation between the variable (e.g., `$status_flags`) and the specified `value` (e.g., `$check_bit`), saving the result in the variable. This is useful for checking if a particular bit is set.

**NOTE**: math.bitwise.and mutates the value, it doesn't have a return value.

# math.add

```xs
math.add $cart_total {
  value = $item_price
}
```

Adds the specified `value` (e.g., `$item_price`) to the variable (e.g., `$cart_total`) and updates the variable with the sum. Perfect for accumulating values, like adding an item’s cost to a cart total.

**NOTE**: math.add mutates the value, it doesn't have a return value.

# redis.unshift

```xs
redis.unshift {
  key = "task_list"
  value = "urgent_task"
} as $new_list_length
```

Adds an element to the beginning of a Redis list specified by `key`. The `value` is the element to add, and the new length of the list is stored in the variable defined by `as`, here `$new_list_length`.

# redis.incr

```xs
redis.incr {
  package_key = "1"
  key = "visit_counter"
  by = 1
} as $new_count
```

Increments a numeric value in Redis at the specified `key` within a `package_key` namespace by the amount given in `by`. The updated value is stored in the variable specified by `as`, here `$new_count`.

# redis.remove

```xs
redis.remove {
  key = "user_list"
  value = "inactive_user"
  count = 1
}
```

Removes a specified number (`count`) of occurrences of `value` from a Redis list identified by `key`. This is useful for cleaning up lists by removing specific elements.

# redis.del

```xs
redis.del {
  key = "session_data"
}
```

Deletes a key and its associated value from Redis, specified by `key`. This clears the cache entry, freeing up space.

# redis.push

```xs
redis.push {
  package_key = "1"
  key = "message_queue"
  value = "new_message"
} as $queue_length
```

Adds an element to the end of a Redis list identified by `key` within a `package_key` namespace. The `value` is the element to add, and the new list length is stored in the variable defined by `as`, here `$queue_length`.

# redis.ratelimit

```xs
redis.ratelimit {
  key = "api_requests"
  max = 100
  ttl = 60
  error = "Rate limit exceeded"
} as $rate_limit_status
```

Enforces rate limiting on requests using Redis, tracking usage with `key`. It allows up to `max` requests within a `ttl` time window (in seconds). If exceeded, the `error` message is used, and the result (e.g., success or failure) is stored in `$rate_limit_status`.

# redis.range

```xs
redis.range {
  key = "event_log"
  start = 0
  stop = 5
} as $recent_events
```

Retrieves a range of elements from a Redis list specified by `key`, from the `start` index to the `stop` index (inclusive). The result is stored in the variable defined by `as`, here `$recent_events`.

# redis.decr

```xs
redis.decr {
  key = "stock_count"
  by = 1
} as $new_stock
```

Decrements a numeric value in Redis at the specified `key` by the amount given in `by`. The updated value is stored in the variable specified by `as`, here `$new_stock`.

# redis.pop

```xs
redis.pop {
  key = "task_queue"
} as $last_task
```

Removes and returns the last element from a Redis list specified by `key`. The removed element is stored in the variable defined by `as`, here `$last_task`.

# redis.get

```xs
redis.get {
  key = "user_session"
} as $session_data
```

Retrieves the value associated with a `key` from Redis. The result is stored in the variable specified by `as`, here `$session_data`.

# redis.set

```xs
redis.set {
  key = "user_token"
  data = "token123"
  ttl = 3600
}
```

Sets a `key` in Redis to the specified `data` value, with an optional `ttl` (time-to-live in seconds) to control how long the key persists before expiring.

# redis.has

```xs
redis.has {
  key = "user_token"
} as $token_exists
```

Checks if a `key` exists in Redis, returning `true` if it does, `false` otherwise. The result is stored in the variable specified by `as`, here `$token_exists`.

# redis.shift

```xs
redis.shift {
  key = "message_queue"
} as $first_message
```

Removes and returns the first element from a Redis list specified by `key`. The removed element is stored in the variable defined by `as`, here `$first_message`.

# redis.count

```xs
redis.count {
  key = "message_queue"
} as $queue_size
```

Returns the number of elements in a Redis list specified by `key`. The count is stored in the variable defined by `as`, here `$queue_size`.

# redis.keys

```xs
redis.keys {
  where = "user_*"
} as $user_keys
```

Retrieves a list of Redis keys that match the specified `search` pattern (e.g., `user_*` for all keys starting with "user\_"). The matching keys are stored in the variable specified by `as`, here `$user_keys`.

# object.keys

```xs
object.keys {
  value = $user_data
} as $user_data_keys
```

Retrieves the property keys of an object (e.g., `$user_data`) as an array. The resulting array of keys is stored in the variable specified by `as`, here `$user_data_keys`.

# object.values

```xs
object.values {
  value = $product_info
} as $product_values
```

Extracts the values of an object’s properties (e.g., `$product_info`) into an array. The array of values is stored in the variable defined by `as`, here `$product_values`.

# object.entries

```xs
object.entries {
  value = $settings
} as $settings_pairs
```

Returns an array of key-value pairs from an object (e.g., `$settings`), where each pair is an array containing the key and its corresponding value. The result is stored in the variable specified by `as`, here `$settings_pairs`.

# precondition

```xs
precondition (`$user_age >= 18`) {
  error_type = "standard"
  error = "User must be 18 or older"
}
```

Throws an exception if the specified condition (e.g., `$user_age >= 18`) evaluates to `false`. The `error_type` defines the type of error, and `error` provides a custom message to describe the failure.

# return

```xs
return {
  value = $calculation_result
}
```

Halts the execution of the current function and returns the specified `value` (e.g., `$calculation_result`) as the function’s output. This allows early termination with a result.

# security.create_auth_token

```xs
security.create_auth_token {
    table = "users"
    extras = { "role": "admin" }
    expiration = 86400
    id = $user_id
} as $auth_token
```

Generates an encrypted authentication token linked to a database table (e.g., `users`). The `extras` parameter adds optional data, `expiration` sets validity in seconds (e.g., 86400 for 24 hours), and `id` identifies the user. The token is stored in the variable defined by `as`, here `$auth_token`.

# security.create_uuid

```xs
security.create_uuid as $unique_id
```

Generates a Universally Unique Identifier (UUID), a random 128-bit value, stored in the variable defined by `as`, here `$unique_id`.

# security.encrypt

```xs
security.encrypt {
    data = $sensitive_data
    algorithm = "aes-256-cbc"
    key = "encryption_key"
    iv = "init_vector"
} as $encrypted_data
```

Encrypts a payload into binary data using a specified `algorithm` (e.g., `aes-256-cbc`), `key`, and initialization vector (`iv`). The encrypted result is stored in the variable defined by `as`, here `$encrypted_data`.

# security.create_curve_key

```xs
security.create_curve_key {
    curve = "P-256"
    format = "object"
} as $crypto_key
```

Generates a cryptographic key using an elliptic curve type (`P-256`, `P-384`, or `P-521`). The `format` parameter sets the output type (e.g., `object`), and the key is stored in the variable defined by `as`, here `$crypto_key`.

# security.random_bytes

```xs
security.random_bytes {
    length = 16
} as $random_bytes
```

Generates a string of random bytes with the specified `length` (e.g., 16), stored in the variable defined by `as`, here `$random_bytes`.

# security.create_password

```xs
security.create_password {
    character_count = 12
    require_lowercase = true
    require_uppercase = true
    require_digit = true
    require_symbol = false
    symbol_whitelist = ""
} as $generated_password
```

Generates a random password based on rules like `character_count` (e.g., 12) and requirements for lowercase, uppercase, digits, and symbols. The `symbol_whitelist` limits allowed symbols. The password is stored in the variable defined by `as`, here `$generated_password`.

# security.decrypt

```xs
security.decrypt {
    data = $encrypted_data
    algorithm = "aes-256-cbc"
    key = "encryption_key"
    iv = "init_vector"
} as $decrypted_data
```

Decrypts a payload back to its original form using the specified `algorithm` (e.g., `aes-256-cbc`), `key`, and initialization vector (`iv`). The decrypted result is stored in the variable defined by `as`, here `$decrypted_data`.

# security.jwe_decode

```xs
security.jwe_decode {
    token = $jwe_token
    key = "decryption_key"
    check_claims = { "iss": "my_app" }
    key_algorithm = "A256KW"
    content_algorithm = "A256GCM"
    timeDrift = 0
} as $decoded_payload
```

Decodes a JSON Web Encryption (JWE) token using the `key`, specified `key_algorithm` (e.g., `A256KW`), and `content_algorithm` (e.g., `A256GCM`). Optional `check_claims` validates token claims, and `timeDrift` adjusts time validation. The result is stored in the variable defined by `as`, here `$decoded_payload`.

# security.jws_encode

```xs
security.jws_encode {
    headers = { "alg": "HS256" }
    claims = { "user_id": "123" }
    key = "signing_key"
    signature_algorithm = "HS256"
    ttl = 3600
} as $signed_token
```

Encodes a payload as a JSON Web Signature (JWS) token with `headers`, `claims`, and a `key`. The `signature_algorithm` (e.g., `HS256`) signs the token, and `ttl` sets its validity in seconds (e.g., 3600). The token is stored in the variable defined by `as`, here `$signed_token`.

# security.jws_decode

```xs
security.jws_decode {
    token = $jws_token
    key = "signing_key"
    check_claims = { "user_id": "123" }
    signature_algorithm = "HS256"
    timeDrift = 0
} as $verified_payload
```

Decodes a JSON Web Signature (JWS) token using the `key` and `signature_algorithm` (e.g., `HS256`). Optional `check_claims` verifies token claims, and `timeDrift` adjusts time validation. The payload is stored in the variable defined by `as`, here `$verified_payload`.

# security.jwe_encode

```xs
security.jwe_encode {
    headers = { "alg": "A256KW" }
    claims = { "data": "secret" }
    key = "encryption_key"
    key_algorithm = "A256KW"
    content_algorithm = "A256GCM"
    ttl = 0
} as $encrypted_token
```

Encodes a payload as a JSON Web Encryption (JWE) token with `headers`, `claims`, and a `key`. The `key_algorithm` (e.g., `A256KW`) and `content_algorithm` (e.g., `A256GCM`) secure the token, and `ttl` sets its validity (0 for no expiration). The token is stored in the variable defined by `as`, here `$encrypted_token`.

# security.create_secret_key

```xs
security.create_secret_key {
    bits = 2048
    format = "object"
} as $secret_key
```

Generates a secret key for digital signatures or symmetric encryption with the specified `bits` (e.g., 2048) and `format` (e.g., `object`). The key is stored in the variable defined by `as`, here `$secret_key`.

# security.random_number

```xs
security.random_number {
    min = 1
    max = 100
} as $random_value
```

Generates a random number between `min` and `max` (e.g., 1 to 100), stored in the variable defined by `as`, here `$random_value`.

# security.check_password

```xs
security.check_password {
    text_password = $user_input_password
    hash_password = $stored_password_hash
} as $is_valid
```

Verifies if a plain-text password (e.g., `$user_input_password`) matches a hashed password (e.g., `$stored_password_hash`). Returns `true` if they match, `false` otherwise, stored in the variable defined by `as`, here `$is_valid`.

# stream.from_jsonl

```xs
stream.from_jsonl {
  value = $jsonl_file
} as $jsonl_stream
```

Parses a JSONL (JSON Lines) file resource and streams its row data. The `value` parameter specifies the JSONL file to process, and the resulting stream is stored in the variable defined by `as`, here `$jsonl_stream`.

# storage.create_file_resource

```xs
storage.create_file_resource {
  filename = "report.txt"
  filedata = $report_content
} as $new_file
```

Creates a new file with the specified `filename` and `filedata` content. The created file resource is stored in the variable specified by `as`, here `$new_file`, for further use.

# storage.sign_private_url

```xs
storage.sign_private_url {
  pathname = "documents/secret.pdf"
  ttl = 60
} as $signed_url
```

Generates a signed URL for a private file at the specified `pathname`, allowing temporary access for a duration defined by `ttl` (in seconds). The signed URL is stored in the variable defined by `as`, here `$signed_url`.

# storage.create_attachment

```xs
storage.create_attachment  {
  value = $input.attachment
  access= "public"
  filename = "attachment.pdf"
} as $attachment_metadata
```

Creates attachment metadata from a file resource specified by `value`, with the given `filename`. The `access` parameter determines if the attachment is `public` or `private`. The metadata is stored in the variable specified by `as`, here `$attachment_metadata`.

# storage.delete_file

```xs
storage.delete_file {
  pathname = "temp/data.csv"
}
```

Deletes a file from storage at the specified `pathname`. This removes the file permanently from the storage system.

# storage.read_file_resource

```xs
storage.read_file_resource {
  value = $input.file
} as $file_content
```

Retrieves the raw data from a file resource specified by `value`. The content of the file is stored in the variable defined by `as`, here `$file_content`.

# storage.create_image

```xs
storage.create_image {
  value = $input.image
  access="public"
  filename = "profile.jpg"
} as $image_metadata
```

Creates image metadata from a file resource specified by `value`, with the given `filename`. The `access` parameter sets the image as `public` or `private`. The metadata is stored in the variable specified by `as`, here `$image_metadata`.

# stream.from_csv

```xs
stream.from_csv {
  value = $csv_file
  separator = ","
  enclosure = "'"
  escape_char = "'"
} as $csv_stream
```

Parses a CSV file resource and streams its row data. The `value` parameter specifies the CSV file, while `separator`, `enclosure`, and `escape_char` define the CSV format. The resulting stream is stored in the variable defined by `as`, here `$csv_stream`.

# stream.from_request

```xs
stream.from_request {
  url = "http://example.com/api/v1"
  method = "GET"
  params = {}|set:"filter":"active"
  headers = []|push:"Authorization: Bearer token123"
  timeout = 15
  follow_location = true
} as $api_stream
```

Converts an external HTTP request into a streaming API response, returning the data as an array. It supports various HTTP methods, query parameters, headers, a `timeout` (in seconds), and an option to `follow_location` for redirects. The stream is stored in the variable specified by `as`, here `$api_stream`.

# switch

```xs
switch ($user_status) {
  case ("active") {
    return {
      value = "User is active"
    }
  } break
  case ("inactive") {
    return {
      value = "User is inactive"
    }
  } break
  default {
    return {
      value = "User status unknown"
    }
  }
}
```

Implements switch-case logic to control script flow based on the value of a variable (e.g., `$user_status`). It evaluates the variable against each `case`, executing the corresponding block if a match is found, or the `default` block if no matches occur.

# text.starts_with

```xs
text.starts_with $message {
  value = "Hello"
} as $starts_with_hello
```

Checks if a text string (e.g., `$message`) begins with the specified `value` (e.g., `"Hello"`). Returns `true` if it does, `false` otherwise, and stores the result in the variable defined by `as`, here `$starts_with_hello`.

# text.icontains

```xs
text.icontains $description {
  value = "error"
} as $has_error
```

Performs a case-insensitive check to see if a text string (e.g., `$description`) contains the specified `value` (e.g., `"error"`). Returns `true` if found, `false` otherwise, and stores the result in `$has_error`.

# text.ltrim

```xs
text.ltrim $user_input {
  value = " "
}
```

Removes leading characters (default is whitespace, or as specified by `value`) from a text string (e.g., `$user_input`). Updates the variable with the trimmed result, useful for cleaning up user input.

# text.rtrim

```xs
text.rtrim $user_input {
  value = " "
}
```

Removes trailing characters (default is whitespace, or as specified by `value`) from a text string (e.g., `$user_input`). Updates the variable with the trimmed result, ensuring no unwanted trailing characters remain.

# text.append

```xs
text.append $greeting {
  value = ", welcome!"
}
```

Adds the specified `value` (e.g., `", welcome!"`) to the end of a text string (e.g., `$greeting`). Updates the variable with the new concatenated string, useful for building messages.

# text.istarts_with

```xs
text.istarts_with $title {
  value = "intro"
} as $starts_with_intro
```

Performs a case-insensitive check to see if a text string (e.g., `$title`) starts with the specified `value` (e.g., `"intro"`). Returns `true` if it does, `false` otherwise, and stores the result in `$starts_with_intro`.

# text.iends_with

```xs
text.iends_with $filename {
  value = "pdf"
} as $ends_with_pdf
```

Performs a case-insensitive check to see if a text string (e.g., `$filename`) ends with the specified `value` (e.g., `"pdf"`). Returns `true` if it does, `false` otherwise, and stores the result in `$ends_with_pdf`.

# text.ends_with

```xs
text.ends_with $url {
  value = ".com"
} as $is_com_domain
```

Checks if a text string (e.g., `$url`) ends with the specified `value` (e.g., `".com"`). Returns `true` if it does, `false` otherwise, and stores the result in `$is_com_domain`.

# text.prepend

```xs
text.prepend $message {
  value = "Alert: "
}
```

Adds the specified `value` (e.g., `"Alert: "`) to the beginning of a text string (e.g., `$message`). Updates the variable with the new concatenated string, useful for adding prefixes.

# text.contains

```xs
text.contains $log_entry {
  value = "error"
} as $has_error
```

Checks if a text string (e.g., `$log_entry`) contains the specified `value` (e.g., `"error"`). Returns `true` if found, `false` otherwise, and stores the result in `$has_error`.

# text.trim

```xs
text.trim $user_input {
  value = " "
}
```

Removes characters (default is whitespace, or as specified by `value`) from both the beginning and end of a text string (e.g., `$user_input`). Updates the variable with the trimmed result, ensuring clean text.

# throw

```xs
throw {
  name = "ValidationError"
  value = "Invalid user input provided"
}
```

Throws an error and halts the script’s execution immediately. The `name` parameter specifies the error type (e.g., `"ValidationError"`), and `value` provides a custom error message to describe the issue.

# try_catch

```xs
try_catch {
  try {
    function.run "divide_fn" {
      input = { a: 10, b: 0 }
    }
  }
  catch {
    debug.log {
      value = "Error occurred: division by zero"
    }
  }
  finally {
    debug.log {
      value = "Operation completed"
    }
  }
}
```

Executes a block of code in the `try` section, catching any errors in the `catch` block for error handling (e.g., logging the error). The optional `finally` block runs regardless of success or failure, useful for cleanup tasks.

# util.send_email

```xs
util.send_email {
  api_key = $env.secret_key
  service_provider = "resend"
  subject = "hellow"
  message = "Hey there"
  to = "some_email@xano.com"
  bcc = []|push:"foo@goo.com"
  cc = ["me@me.com", "john@be.com"]
  from = "admin@xano.com"
  reply_to = "no-reply@xano.com"
  scheduled_at = "2025-11-26T01:01:02.00"
} as $xano_email
```

Sends an email using the specified `"resend"`, with parameters like `subject`, `message`, `to`, `from`, and optional fields such as `bcc`, `cc`, `reply_to`, and `scheduled_at`. The result of the email operation is stored in the variable defined by `as`, here `$xano_email`. Currently, Xano only supports the Resend email service provider.

Xano also offers a built-in email service that can be used without an external provider for testing purposes, all emails using the `xano` service provider will be routed to the admin email address.

```xs
util.send_email {
  service_provider = "xano"
  subject = "hellow"
  message = "Hey there"
} as $xano_email
```

# util.template_engine

```xs
util.template_engine {
  value = """
    Hello, {{ $input.name|capitalize }}!
    Your favorite colors are:
    {% for color in $var.colors %}
    - {{ color|upper }}
    {% endfor %}
    """
} as $rendered_template
```

Renders a template using the TWIG templating engine, allowing for dynamic content generation. The `value` parameter contains the template string, which can include variables and logic. Variables from the current XanoScript context (e.g., `$var`, `$input`) are automatically available within the template.

The engine supports standard TWIG syntax, including variables (`{{ ... }}`), control structures (`{% ... %}`), and filters.

The template engine is useful for HTML pages, AI prompts, SQL query templates, text and Markdown documents, and other dynamic templates.

# util.set_header

```xs
util.set_header {
  value = "Set-Cookie: sessionId=e8bb43229de9; HttpOnly; Secure; Domain=foo.example.com"
  duplicates = "replace"
}
```

Adds a header to the response, specified by `value` (e.g., a cookie header). The `duplicates` parameter determines how to handle duplicate headers, such as `"replace"` to overwrite existing ones.

# util.get_env

```xs
util.get_env as $environment_vars
```

Retrieves all environment variables available in the script’s context and stores them in the variable specified by `as`, here `$environment_vars`. Useful for accessing system-wide settings.

# util.get_all_input

```xs
util.get_all_input as $input_data
```

Captures all parsed input data sent to the script’s context and stores it in the variable specified by `as`, here `$input_data`. This provides a structured view of input parameters.

# util.get_input

```xs
util.get_input as $raw_input
```

Retrieves the raw, unparsed input data for the request and stores it in the variable specified by `as`, here `$raw_input`. This is useful for accessing the original request data before processing.

# util.sleep

```xs
util.sleep {
  value = 5
}
```

Pauses script execution for the specified number of seconds in `value` (e.g., 5 seconds). This can be used to introduce delays between operations.

# util.ip_lookup

```xs
util.ip_lookup {
  value = "123.234.99.22"
} as $location
```

Retrieves the geographic location of an IP address specified in `value`. The location data (e.g., city, country) is stored in the variable defined by `as`, here `$location`.

# util.geo_distance

```xs
util.geo_distance {
  latitude_1 = 40.71
  longitude_1 = 74
  latitude_2 = 48.86
  longitude_2 = 2.35
} as $distance
```

Calculates the distance between two geographic points, specified by their `latitude_1`, `longitude_1` (first point) and `latitude_2`, `longitude_2` (second point). The computed distance is stored in the variable defined by `as`, here `$distance`.

# while

```xs
while (`$retry_count < 5`) {
  each {
    var.update $retry_count {
      value = `$retry_count + 1`
    }
  }
}
```

Continuously loops through a block of code as long as the specified condition (e.g., `$retry_count < 5`) evaluates to `true`. The `each` block contains the actions to repeat until the condition becomes `false`.

# zip.create_archive

```xs
zip.create_archive {
  filename = "backup.zip"
} as $zip_archive
```

Creates a new compressed zip archive with the specified `filename`. The created zip file resource is stored in the variable defined by `as`, here `$zip_archive`, for further use.

# zip.add_to_archive

```xs
zip.add_to_archive {
  file = $input.file
  zip = $zip_archive
}
```

Adds a file (specified by `file`) to an existing zip archive (specified by `zip`). This updates the zip archive with the new file content.

# zip.delete_from_archive

```xs
zip.delete_from_archive {
  filename = $input.file
  zip = $input.file
}
```

Removes a file (specified by `filename`) from an existing zip archive (specified by `zip`). This deletes the file from the archive without affecting other contents.

# zip.extract

```xs
zip.extract {
  zip = $zip_archive
} as $extracted_files
```

Extracts the contents of a zip archive (specified by `zip`) into individual files. The extracted files are stored in the variable defined by `as`, here `$extracted_files`.

# zip.view_contents

```xs
zip.view_contents {
  zip = $input.file
} as $archive_contents
```

Lists the contents of a zip archive (specified by `zip`), providing details such as file names within the archive. The list is stored in the variable defined by `as`, here `$archive_contents`.

# cloud.azure.storage.sign_url

```xs
cloud.azure.storage.sign_url {
    account_name = "my_storage_account"
    account_key = "my_secret_key"
    container_name = "documents"
    path = "reports/annual.pdf"
    ttl = 300
} as $document_access_url
```

Generates a signed URL for securely accessing a blob in Azure Blob Storage. The URL remains valid for the duration specified by `ttl` (in seconds), allowing temporary access to the file, and is stored in a variable for later use.

# cloud.aws.s3.sign_url

```xs
cloud.aws.s3.sign_url {
    bucket = "company_assets"
    region = "us-east-1"
    key = "my_aws_key"
    secret = "my_aws_secret"
    file_key = "images/logo.png"
    ttl = 300
} as $logo_access_url
```

Creates a signed URL for accessing an object in an AWS S3 bucket, providing temporary access for the time set by `ttl` (in seconds). The URL is stored in the specified variable.

# cloud.aws.s3.list_directory

```xs
cloud.aws.s3.list_directory {
    bucket = "media_library"
    region = "us-west-2"
    key = "my_aws_key"
    secret = "my_aws_secret"
    prefix = "videos/"
    next_page_token = $previous_page_token
} as $video_list
```

Lists the contents of an AWS S3 bucket, optionally filtered by a `prefix`, with support for pagination via `next_page_token`. The resulting list is stored in the specified variable.

# cloud.google.storage.upload_file

```xs
cloud.google.storage.upload_file {
    service_account = "my_service_account_json"
    bucket = "user_uploads"
    filePath = "photos/vacation.jpg"
    file = $uploaded_image
    metadata = { "description": "Beach vacation photo" }
}
```

Uploads a file to Google Cloud Storage at the specified `filePath` in a bucket, with optional `metadata` for additional details.

# cloud.elasticsearch.request

```xs
cloud.elasticsearch.request {
    auth_type = "API Key"
    key_id = "my_key_id"
    access_key = "my_access_key"
    method = "GET"
    url = "https://my-elastic-cluster.com/posts/_search"
    payload = { "query": { "match": { "category": "tech" } } }
} as $search_results
```

Sends an HTTP request to an Elastic Search cluster, executing the specified `method` with an optional `payload`. The response is stored in the given variable.

# cloud.azure.storage.list_directory

```xs
cloud.azure.storage.list_directory {
    account_name = "my_storage_account"
    account_key = "my_secret_key"
    container_name = "archives"
    path = "2023/"
} as $yearly_archives
```

Lists the contents of an Azure Blob Storage container, optionally filtered by a `path`. The list is stored in the specified variable.

# cloud.aws.opensearch.document

```xs
cloud.aws.opensearch.document {
    auth_type = "IAM"
    key_id = "my_aws_key"
    access_key = "my_aws_secret"
    region = "us-east-1"
    base_url = "https://my-opensearch-domain.com"
    index = "articles"
    method = "POST"
    doc_id = "article_123"
} as $article_response
```

Manages records (e.g., create, read, update, delete) in an AWS OpenSearch index using the specified `method`. The response is stored in the given variable.

# cloud.elasticsearch.document

```xs
cloud.elasticsearch.document {
    auth_type = "API Key"
    key_id = "my_key_id"
    access_key = "my_access_key"
    base_url = "https://my-elastic-cluster.com"
    index = "users"
    method = "GET"
    doc_id = "user_456"
} as $user_profile
```

Manages records in an Elastic Search index (e.g., create, read, update, delete) with the specified `method`. The response is stored in the given variable.

# cloud.aws.s3.read_file

```xs
cloud.aws.s3.read_file {
    bucket = "app_resources"
    region = "us-west-2"
    key = "my_aws_key"
    secret = "my_aws_secret"
    file_key = "configs/settings.json"
} as $app_settings_file
```

Reads a file from an AWS S3 bucket and stores its contents in a variable as a file resource.

# cloud.azure.storage.delete_file

```xs
cloud.azure.storage.delete_file {
    account_name = "my_storage_account"
    account_key = "my_secret_key"
    container_name = "temp_files"
    filePath = "drafts/old_draft.docx"
}
```

Deletes a blob from an Azure Blob Storage container at the specified `filePath`.

# cloud.aws.s3.delete_file

```xs
cloud.aws.s3.delete_file {
    bucket = "user_backups"
    region = "us-east-1"
    key = "my_aws_key"
    secret = "my_aws_secret"
    file_key = "backups/2023-01.zip"
}
```

Deletes an object from an AWS S3 bucket at the specified `file_key`.

# cloud.google.storage.read_file

```xs
cloud.google.storage.read_file {
    service_account = "my_service_account_json"
    bucket = "app_data"
    filePath = "logs/error_log.txt"
} as $error_log_file
```

Reads a file from Google Cloud Storage and stores its contents in a variable as a file resource.

# cloud.aws.s3.get_file_info

```xs
cloud.aws.s3.get_file_info {
    bucket = "product_images"
    region = "us-east-1"
    key = "my_aws_key"
    secret = "my_aws_secret"
    file_key = "items/shirt.jpg"
} as $image_metadata
```

Retrieves metadata (e.g., size, last modified) about an object in an AWS S3 bucket, storing it in a variable.

# cloud.aws.opensearch.request

```xs
cloud.aws.opensearch.request {
    auth_type = "IAM"
    key_id = "my_aws_key"
    access_key = "my_aws_secret"
    region = "us-west-2"
    method = "POST"
    url = "https://my-opensearch-domain.com/_search"
    query = { "query": { "term": { "status": "active" } } }
} as $active_items
```

Sends a request to AWS OpenSearch with the specified `method` and `query`, storing the response in a variable.

# cloud.google.storage.list_directory

```xs
cloud.google.storage.list_directory {
    service_account = "my_service_account_json"
    bucket = "project_files"
    path = "designs/"
} as $design_files
```

Lists the contents of a Google Cloud Storage bucket, optionally filtered by `path`, storing the result in a variable.

# cloud.google.storage.sign_url

```xs
cloud.google.storage.sign_url {
    service_account = "my_service_account_json"
    bucket = "public_assets"
    filePath = "downloads/guide.pdf"
    method = "GET"
    ttl = 300
} as $guide_download_url
```

Generates a signed URL for accessing a file in Google Cloud Storage, valid for `ttl` seconds, with the specified `method`.

# cloud.google.storage.get_file_info

```xs
cloud.google.storage.get_file_info {
    service_account = "my_service_account_json"
    bucket = "app_assets"
    filePath = "icons/app_icon.png"
} as $icon_details
```

Retrieves metadata about a file in Google Cloud Storage, storing it in a variable.

# cloud.azure.storage.get_file_info

```xs
cloud.azure.storage.get_file_info {
    account_name = "my_storage_account"
    account_key = "my_secret_key"
    container_name = "media"
    filePath = "videos/intro.mp4"
} as $video_metadata
```

Retrieves metadata about a blob in Azure Blob Storage, storing it in a variable.

# cloud.aws.opensearch.query

```xs
cloud.aws.opensearch.query {
    auth_type = "IAM"
    key_id = "my_aws_key"
    access_key = "my_aws_secret"
    region = "us-east-1"
    base_url = "https://my-opensearch-domain.com"
    index = "products"
    return_type = "search"
    expression = [{ "field": "price", "value": "100", "op": "lt" }]
    size = 10
    from = 0
    included_fields = ["name", "price"]
    sort = [{ "field": "price", "order": "asc" }]
    payload = {}
} as $cheap_products
```

Performs a search query on AWS OpenSearch with customizable filters, pagination, and sorting, storing results in a variable.

# cloud.aws.s3.upload_file

```xs
cloud.aws.s3.upload_file {
    bucket = "user_content"
    region = "us-west-2"
    key = "my_aws_key"
    secret = "my_aws_secret"
    file_key = "uploads/profile.jpg"
    file = $user_photo
    metadata = { "user_id": "123" }
    object_lock_mode = "governance"
    object_lock_retain_until = "2025-12-31"
} as $upload_result
```

Uploads a file to an AWS S3 bucket with optional metadata and object lock settings, storing the response in a variable.

# cloud.algolia.request

```xs
cloud.algolia.request {
    application_id = "my_algolia_app_id"
    api_key = "my_algolia_api_key"
    url = "https://my-algolia-app.algolia.net/1/indexes/posts/query"
    method = "POST"
    payload = { "query": "tech" }
} as $tech_posts
```

Sends a request to Algolia with the specified `method` and `payload`, storing the response in a variable.

# cloud.azure.storage.upload_file

```xs
cloud.azure.storage.upload_file {
    account_name = "my_storage_account"
    account_key = "my_secret_key"
    container_name = "user_files"
    filePath = "docs/resume.pdf"
    file = $user_resume
    metadata = { "owner": "Jane" }
} as $upload_confirmation
```

Uploads a file to Azure Blob Storage with optional metadata, storing the response in a variable.

# cloud.google.storage.delete_file

```xs
cloud.google.storage.delete_file {
    service_account = "my_service_account_json"
    bucket = "temp_storage"
    filePath = "old/temp_data.csv"
}
```

Deletes a file from Google Cloud Storage at the specified `filePath`.

# cloud.elasticsearch.query

```xs
cloud.elasticsearch.query {
    auth_type = "API Key"
    key_id = "my_key_id"
    access_key = "my_access_key"
    base_url = "https://my-elastic-cluster.com"
    index = "orders"
    return_type = "search"
    expression = [{ "field": "total", "value": "50", "op": "gt" }]
    size = 5
    from = 0
    included_fields = ["id", "total"]
    sort = [{ "field": "total", "order": "desc" }]
    payload = {}
} as $large_orders
```

Executes a search query on Elastic Search with filters, pagination, and sorting, storing results in a variable.

# cloud.azure.storage.read_file

```xs
cloud.azure.storage.read_file {
    account_name = "my_storage_account"
    account_key = "my_secret_key"
    container_name = "logs"
    filePath = "daily/2023-10-01.log"
} as $daily_log_file
```

Reads a blob from Azure Blob Storage and stores its contents in a variable as a file resource.


## Best Practices

1. **Design clear agent roles** - Define specific purposes and capabilities for each agent
2. **Document tools thoroughly** - Add detailed descriptions and examples
3. **Test agent interactions** - Verify agents can communicate and collaborate properly
4. **Use environment variables** - Store sensitive data like API keys securely
5. **Implement error handling** - Ensure tools handle failures gracefully
6. **Check for errors** - Use #tool:get_errors to verify your code has no syntax or validation errors after making changes
