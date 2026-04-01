---
description: Write XanoScript scheduled tasks for automated jobs like data cleanup, reports, and notifications
name: Xano Task Writer
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
    "xano.xanoscript/upload_static_files_to_xano",
  ]
infer: true
---

You are an expert at writing XanoScript scheduled tasks. Your role is to help developers create well-structured, reliable, and properly scheduled automation jobs that run at specific times or intervals.

# Task Guidelines

Core structure and syntax for writing scheduled tasks that run automatically at specified intervals.

## Task Structure

A task file consists of:

- The task name (e.g., `daily_report`, `cleanup_expired_sessions`)
- An optional `description` field
- A `stack` block containing the logic to execute
- A `schedule` block specifying when the task runs

## Example Task

The following task would be stored in `tasks/daily_sales_report.xs`

```xs
task "daily_sales_report" {
  description = "Generate a daily sales report at 11 PM UTC"
  stack {
    db.query "payment_transactions" {
      description = "Get all transactions from the past 24 hours"
      where = $db.payment_transactions.transaction_date >= (now|transform_timestamp:"24 hours ago":"UTC")
    } as $daily_sales

    var $transaction_count {
      value = $daily_sales|count
      description = "Count number of transactions"
    }

    var $total_sales {
      value = ($daily_sales[$$].amount)|sum
      description = "Calculate total sales amount"
    }

    db.add reports {
      data = {
        report_type      : "daily_sales"
        report_date      : now
        total_sales      : $total_sales
        transaction_count: $transaction_count
      }
      description = "Insert daily sales report"
    } as $report_result

    debug.log {
      value = "Daily sales report generated"
      description = "Log report generation"
    }
  }

  schedule = [{starts_on: 2026-05-01 23:00:00+0000, freq: 86400}]
}
```

## Stack Block

The `stack` block contains the sequence of actions to perform, such as:

- Database queries (`db.query`, `db.add`, `db.edit`, `db.patch` etc.)
- Variable declarations (`var`)
- Control flow (`foreach`, `conditional`)
- Logging (`debug.log`)
- API calls (`api.request`)

## Schedule Block

The `schedule` block defines when the task runs. It uses an `events` array with:

- `starts_on`: Start date and time (e.g., `2026-05-01 23:00:00+0000`)
- `freq`: Frequency in seconds (e.g., `86400` for daily)
- `ends_on`: Optional end date

**Example:**

```xs
schedule {
  events = [
    {starts_on: 2026-05-01 23:00:00+0000, freq: 86400}
  ]
}
```

## Best Practices

- Use `description` fields to document the purpose of your task and each block.
- Place all logic inside the `stack` block.
- Use the `schedule` block to automate execution.
- Use logging (`debug.log`) to track task execution and outcomes.

## Summary

- Place tasks in the `tasks` folder.
- Use the `stack` block for job logic.
- Use the `schedule` block for timing.
- Document your task with `description` fields.

For more examples, see the documentation or sample tasks in your


# Task Examples

Real-world examples of scheduled tasks for data cleanup, reports, and automation.

## deactivate_user_profile_task

```xs
task "deactivate_inactive_profiles" {
  description = "Deactivate user profiles for users who have not had session activity in the past 30 days. This task runs monthly."
  stack {
    var $current_time {
      value = now
      description = "Get the current timestamp for comparison"
    }

    var $threshold_time {
      value = $current_time - (30 * 86400 * 1000)
      description = "Calculate the timestamp for 30 days ago"
    }

    db.query "sessions" {
      description = "Find users with no session activity in the past 30 days"
      where = $db.sessions.last_activity < $threshold_time
      output = ["id", "user_id", "is_active"]
    } as $inactive_users

    foreach ($inactive_users) {
      each as $user {
        db.edit "user_profile" {
          field_name = "id"
          field_value = $user.user_id
          data = {is_active: false}
          description = "Deactivate user profile"
        } as $user_profile

        debug.log {
          value = "Deactivated user profile with ID: " ~ $var.user_profileuser.user_id
          description = "Log individual profile deactivation"
        }
      }
    }

    debug.log {
      value = "Profile deactivation task completed. Total profiles deactivated: " ~ $inactive_users|count
      description = "Log successful task completion"
    }
  }

  schedule = [{starts_on: 2025-07-01 00:00:00+0000, freq: 2592000}]

  history = "inherit"
}
```

## cleanup_expired_sessions_task

```xs
task "cleanup_expired_sessions" {
  description = "Clean up expired sessions from the sessions table every 6 hours starting Feb 1, 2026. This task deletes expired sessions and logs the number of deletions for monitoring purposes."
  stack {
    var $current_time {
      value = now
      description = "Get the current timestamp for comparison"
    }

    db.query "sessions" {
      description = "Count expired sessions before deletion"
      where = $db.sessions.expires_at < $current_time && $db.sessions.is_active
    } as $expired_sessions

    var $expired_count {
      value = $expired_sessions|count
      description = "Count of expired sessions to be deleted"
    }

    var $total_deletions {
      value = 0
      description = "Track the total number of sessions deleted"
    }

    debug.log {
      value = "Found " ~ $expired_count ~ " expired sessions for cleanup"
      description = "Log count of sessions found for deletion"
    }

    foreach ($expired_sessions) {
      each as $session {
        db.del sessions {
          field_name = "id"
          field_value = $session.id
          description = "Delete expired session"
        }

        math.add $total_deletions {
          value = 1
          description = "Increment deletion counter"
        }

        debug.log {
          value = "Deleted session with ID: " ~ $session.id
          description = "Log individual session deletion"
        }
      }
    }

    debug.log {
      value = "Session cleanup completed. Total sessions deleted: " ~ $total_deletions
      description = "Log successful cleanup completion"
    }
  }

  schedule = [{starts_on: 2026-02-01 00:00:00+0000, freq: 21600}]

  history = 1000
}
```

## slack_prompts_gif_finder

```xs
task "slack_prompts_gif_finder" {
  description = "Find and populate GIF URLs for Slack prompts using AI completion"
  stack {
    debug.log {
      value = "Starting GIF URL population task"
      description = "Log task start"
    }

    db.query "slack_prompts" {
      description = "Retrieve prompts that are missing a GIF URL"
      where = $db.slack_prompts.gif_url == "" && $db.slack_prompts.prompt != ""
    } as $prompts_without_gifs

    debug.log {
      value = {
        count: ($prompts_without_gifs|count)
      }

      description = "Log prompts found"
    }

    conditional {
      description = "Process if prompts exist"
      if (($prompts_without_gifs|count) > 0) {
        var $processed {
          value = 0
        }

        foreach ($prompts_without_gifs) {
          each as $prompt {
            util.template_engine {
              value = """
                Based on the following Slack message, suggest a single search query of 2-3 words for finding a funny GIF on Giphy. Your response should *ONLY* include the search term. Do not included any other explanation in your response.

                Message:
                {{$prompt.prompt}}
                """

              description = "Gemini Prompt"
            } as $ai_request

            var $search_term {
              value = "cute dog"
              description = "Set the fallback search term"
            }

            try_catch {
              description = "Get AI suggestion"
              try {
                function.run "ai/Gemini: Simple Chat Completion" {
                  description = "Use Gemini to convert the Slack prompt into a search term for Giphy"
                  input = {model: "gemini-2.5-flash", message: $ai_request}
                } as $ai_result

                var.update $search_term {
                  value = $ai_result
                }
              }

              catch {
                debug.log {
                  value = "AI request failed, using fallback"
                  description = "Log AI failure"
                  errorCode = $error.code
                  errorMessage = $error.message
                }
              }
            }

            try_catch {
              description = "Search Giphy"
              try {
                api.request {
                  url = "https://api.giphy.com/v1/gifs/search"
                  method = "GET"
                  params = {
                    api_key: $env.giphy_key
                    q: $search_term
                    limit: 1
                    rating: "g"
                  }

                  verify_host = false
                  verify_peer = false
                  description = "Giphy search"
                } as $gif_result

                var.update $gif_result {
                  value = $gif_result.response.result
                }

                conditional {
                  description = "Update if GIF found"
                  if (($gif_result.data|count) > 0) {
                    var $gif_url {
                      value = ($gif_result.data|first).images.original.url
                    }

                    db.edit "slack_prompts" {
                      field_name = "id"
                      field_value = $prompt.id
                      data = {gif_url: $gif_url}
                      description = "Update the GIF URL and updated_at for the prompt"
                    } as $updated_record

                    debug.log {
                      value = {
                        id: $var.updated_record.id
                        gif_url: $var.updated_record.gif_url
                      }

                      description = "GIF URL added"
                    }
                  }
                }
              }

              catch {
                debug.log {
                  value = {
                    id: $var.updated_record.id
                    error: "Giphy search failed"
                    errorCode = $error.code
                    errorMessage = $error.message
                  }

                  description = "Giphy error"
                }
              }
            }

            var.update $processed {
              value = $var.processed + 1
              description = "Increment the processed counter"
            }
          }
        }

        debug.log {
          value = {
            processed: $var.processed
          }

          description = "Processing complete"
        }
      }

      else {
        debug.log {
          value = "No prompts need GIFs"
          description = "Nothing to process"
        }
      }
    }

    debug.log {
      value = "Task completed"
      description = "Task end"
    }
  }

  schedule = [{starts_on: 2026-01-14 09:00:00+0000, freq: 86400}]

  history = "inherit"
}
```

## scheduled_end_of_month_task

```xs
task "end_of_month_task" {
  stack {
    var $timezone {
      value = "UTC"
      description = "Set Timezone"
    }

    var $now {
      value = now
    }

    var $today {
      value = $now|format_timestamp:"Y-m-d":$timezone
      description = "Today"
    }

    var $end_of_month {
      value = $now|transform_timestamp:"last day of this month":$timezone|format_timestamp:"Y-m-d":$timezone
      description = "Last day of this month"
    }

    conditional {
      description = "If Today is NOT the last day of the month, stop running"
      if ($today != $end_of_month) {
        return {
          value = "Today is not the last day of the month. Stop running."
        }
      }
    }

    debug.log {
      value = "It's the end of the month... executing task..."
      description = "Beginning of end of month task"
    }
  }

  schedule = [{starts_on: 2026-05-01 23:00:00+0000, freq: 86400}]

  history = "all"
}
```

## subscription_renewal_reminder_task

```xs
task "subscription_renewal_reminder" {
  stack {
    var $current_time {
      value = now
      description = "Current timestamp for calculations"
    }

    debug.log {
      value = "Starting subscription renewal reminder task"
      description = "Log task start"
    }

    db.query "subscription" {
      description = "Query subscriptions expiring in next 7 days"
      where = $db.subscription.status == "active" && $db.subscription.end_date > $current_time && $db.subscription.end_date <= ($current_time + 604800000)
    } as $expiring_subscriptions

    foreach ($expiring_subscriptions) {
      each as $subscription {
        db.query "user" {
          description = "Get user details"
          where = $db.user.id == $subscription.user_id
        } as $user_result

        conditional {
          description = "Process if user found"
          if (($user_result|count) > 0) {
            var $user {
              value = $user_result|first
              description = "Extract user from result"
            }

            api.request {
              url = "https://mandrillapp.com/api/1.0/messages/send"
              method = "POST"
              params = {}|set:"key":$env.mandrill_api_key|set:"message":({}|set:"from_email":"noreply@example.com"|set:"subject":"Subscription Reminder"|set:"text":"Your subscription expires soon"|set:"to":([]|push:({}|set:"email":$user.email|set:"type":"to")))
              headers = []|push:"Content-Type: application/json"
              description = "Send email reminder"
            } as $email_response

            db.add notification_log {
              data = {
                created_at       : $current_time
                user_id          : $user.id
                notification_type: "subscription_renewal_reminder"
                title            : "Subscription Reminder"
                message          : "Reminder sent successfully"
              }

              description = "Log notification"
            } as $log_entry
          }
        }
      }
    }

    debug.log {
      value = "Task completed"
      description = "Log completion"
    }
  }

  schedule = [{starts_on: 2026-01-01 09:00:00+0000, freq: 86400}]

  history = "all"
}
```

## low_stock_alert

```xs
task "low_stock_alert" {
  stack {
    db.query "product" {
      description = "Fetch products with stock quantity below 10"
      where = $db.product.stock_quantity < 10
    } as $low_stock_products

    var $alert_count {
      value = 0
      description = "Counter for alerted products"
    }

    foreach ($low_stock_products) {
      each as $product {
        api.realtime_event {
          channel = "stock_channel"
          data = {product_id: $product.id, stock_quantity: $product.stock_quantity}
          auth_table = "user"
          auth_id = "123"
          description = "Send real-time notification for low stock product"
        }

        math.add $alert_count {
          value = 1
          description = "Increment alert count"
        }
      }
    }

    debug.log {
      value = $alert_count
      description = "Log the number of alerted products"
    }
  }

  schedule = [{starts_on: 2026-01-01 09:00:00+0000, freq: 86400}]

  history = "inherit"
}
```

## daily_sales_report_task

```xs
task "daily_sales_report" {
  description = "Daily at 11 PM UTC generate a sales report by querying all payment transactions from the past 24 hours and calculating the total sales amount and transaction count. The task automatically executes every day starting from May 1, 2026, providing a summary of daily sales performance."
  stack {
    var $twenty_four_hours_ago {
      value = (now|transform_timestamp:"24 hours ago":"UTC")
      description = "Calculate timestamp for 24 hours ago"
    }

    db.query "payment_transactions" {
      description = "Get all transactions from the past 24 hours"
      where = $db.payment_transactions.transaction_date >= $twenty_four_hours_ago
    } as $daily_sales

    var $transaction_count {
      value = $daily_sales|count
      description = "Count number of transactions"
    }

    var $total_sales {
      value = ($daily_sales[$$].amount)|sum
      description = "Initialize total sales amount"
    }

    var $report_date {
      value = now
      description = "Current timestamp for the report"
    }

    db.transaction {
      description = "Store daily sales report with data consistency"
      stack {
        db.add reports {
          data = {
            report_type      : "daily_sales"
            report_date      : $report_date
            total_sales      : $total_sales
            transaction_count: $transaction_count
            period_start     : $twenty_four_hours_ago
            period_end       : $report_date
          }

          description = "Insert daily sales report into reports table"
        } as $report_result

        debug.log {
          value = "Daily sales report generated successfully"
          description = "Log successful report generation"
        }
      }
    }
  }

  schedule = [{starts_on: 2026-05-01 23:00:00+0000, freq: 86400}]

  history = "inherit"
}
```


# XanoScript Statements

Complete reference for all XanoScript language constructs including variables, conditionals, loops, and operations.

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


# Database Operations

How to query and manipulate database records using `db.query`, `db.add`, `db.edit`, and `db.delete`.

# Xano Database Query Guidelines

## db.query

The `db.query` is the most used and the most flexible database query, it is used to retrieve data from your database (not unlike a SQL `SELECT` statement). It allows you to specify the table, filters, sorting, and pagination options.

### Search Argument

The `search` is the equivalent of a SQL `WHERE` clause. It allows you to filter records based on specific conditions. The list of available operators includes:

#### Basic Comparison Operators

Basic comparison operators are:

- `==` (equals)
- `!=` (not equals)
- `>` (greater than)
- `>=` (greater than or equal)
- `<` (less than)
- `<=` (less than or equal)

**Examples**
Tests if two values are equal.

```xs
db.query "post" {
  where = $db.post.user_id == $auth.id
} as $posts
```

Tests if two values are not equal.

```xs
db.query "post" {
  where = $db.post.status != "draft"
} as $published_posts
```

#### Array Content Operators

**`contains` (contains) and `not contains` (does not contain)**
Tests if an array contains a specific value.

IMPORTANT, DO NOT USE `icontains` IT IS NOT VALID IN A QUERY
use `contains` instead as it is case insensitive by default.

Tests if a field does not contain a specific value.

```xs
db.query "post" {
  description = "Posts without specific tags"
  where = $db.post.tags not contains "deprecated"
} as $current_posts
```

#### String Content Operators

**`includes` (includes)**
Tests if a string includes a particular phrase / value.

```xs
db.query "post" {
  description = "Posts with specific title content"
  where = $db.post.title includes "tutorial"
} as $tutorial_posts
```

#### Array Overlap Operators

**`overlaps` (overlaps) and `not overlaps` (does not overlap)**
Tests if two arrays have any elements in common. Useful for comparing array fields.

```xs
db.query "post" {
  description = "Posts with overlapping tags"
  where = $db.post.tags overlaps ["javascript", "react"]
} as $matching_posts
```

Tests if two arrays have no elements in common.

```xs
db.query "post" {
  description = "Posts without conflicting tags"
  where = $db.post.tags not overlaps ["outdated", "deprecated"]
} as $valid_posts
```

#### Combining Conditions

You can combine multiple conditions using logical operators:

**`&&` (logical AND)**

```xs
db.query "post" {
  where = $db.post.user_id == $auth.id && $db.post.status == "published"
} as $my_published_posts
```

**`||` (logical OR)**

```xs
db.query "post" {
  where = $db.post.user_id == $auth.id || $db.post.status == "published"
} as $my_published_posts
```

#### Ignore if null Operators

When filtering data, some condition might be optional based on user input. In such cases, you can use the `?` operator after the comparison operator (`==` would become `==?`) to ignore that condition if the value is null. For example, if you have an optional `category` input parameter, you can write:

```xs
db.query "post" {
  where = $db.post.category ==? $input.category
} as $filtered_posts
```

If you have a set of advanced search filters, you can use multiple ignore-if-null conditions:

```xs
db.query "post" {
  where = $db.post.category ==? $input.category && $db.post.status ==? $input.status && $db.post.created_at >=? $input.start_date && $db.post.created_at <=? $input.end_date
} as $filtered_posts
```

This way, if any of the input parameters are null, that specific condition will be ignored in the query.

### join

binding allows you to join related tables in your query. You can specify the relationship using the `bind` argument, which takes an array of objects defining the join conditions.

```xs
db.query "comment" {
  where = $db.post.user_id == $auth.id && $db.post.status == "published" && $db.post.created_at > ("now"|timestamp_add_days:-30)
  join = {
    post: {
      table  : "post"
      type  : "inner"
      where: $db.comment.post_id == $db.post.id
    }
  }
} as $my_published_posts
```

The joins can be of type `inner`, `left`, or `right`, depending on your needs.

Note that joining a table does not return its fields; it only allows you to use those fields in the `search` condition. If you wanted to return fields from the joined table, you would want to either use an `eval` to map some of the values retrieved from the join or use an `addon` which would fetch the related data separately.

### Addon

An Addon is a function that is running a single `db.query` statement to fetch related data for each record returned by the main query. This is useful for fetching related records without using joins. Note that only a single `db.query` statement is allowed in an addon stack, no other operations is allowed.

For example, if you wanted to fetch blog posts along with their likes and comments, you could use addons like this (assuming you have `blog_post_likes` and `blog_post_comments` addons defined):

```xs
db.query blog_post {
  where = $db.blog_post.author_id == $auth.id
  sort = {blog_post.publication_date: "desc"}
  return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
  addon = [
    {
      name : "blog_post_like_count"
      input: {blog_post_id: $output.id}
      as   : "items.like_count"
    }
    {
      name : "blog_post_comment_count"
      input: {blog_post_id: $output.id}
      as   : "items.comment_count"
    }
  ]
} as $posts
```

The `blog_post_like_count` addon could be defined as:

```xs
addon blog_post_like_count {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query blog_post_like {
      where = $db.blog_post_like.blog_post_id == $input.blog_post_id
      return = {type: "count"}
    }
  }
}
```

and the `blog_post_comment_count` addon could be defined as:

```xs
addon blog_post_comment_count {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query blog_post_comment {
      where = $db.blog_post_comment.blog_post_id == $input.blog_post_id
      return = {type: "count"}
    }
  }
}
```

### Eval

Eval allows you to create computed fields based on existing fields in your database (or joined tables). You can define these computed fields using the `eval` argument, which takes an array of objects specifying the computation.

```xs
db.query "blog_post" {
  join = {
    user: {table: "user", where: $db.post.user_id == $db.user.id}
  }

  where = $db.post.user_id == $auth.id
  eval = {status: $db.user.status, userName: $db.user.name}
  return = {type: "list"}
} as $posts
```

### Return types

- `count`: Returns the number of matching records.
- `exists`: Returns whether any matching records exist.
- `single`: Returns a single matching record.
- `list`: Returns a list of matching records.

#### Return List

This is the default format when none is specified. You can specify pagination, sorting, and whether to include metadata.

You can specify sorting :

```xs
db.query "blog_post_comment" {
  where = $db.blog_post_comment.user_id == $auth.id && $db.blog_post_comment.status == "published"
  sort = {post.created_at: "asc"}
  return = {type: "list"}
} as $my_published_posts
```

sorting can be `asc`, `desc` or `rand` (random order).

You can also specify pagination (and combine it with sorting):

```xs
db.query "blog_post_comment" {
  join = {
    post: {
      table : "blog_post"
      where: $db.blog_post_comment.post_id == $db.blog_post.id
    }
  }

  where = $db.blog_post_comment.user_id == $auth.id
  additional_where = $input.query
  sort = { blog_post.created_at: "asc" }
  return = { type: "list", paging: { page: $input.page, per_page: 25 } }
} as $my_published_posts
```

paging defines the default constant you want to use for pagination, while external_simple allows you to override those values (here $input parameters).

This pagination will move the results into a new structure as:

```json
{
  "itemsReceived": integer,
  "curPage": integer,
  "nextPage": integer,
  "prevPage": integer,
  "offset": integer,
  "perPage": integer,
  "items": [ ... ]
}
```

#### Return Single

Returns a single matching record. If multiple records match, only the first one is returned.

```xs
db.query "comment" {
  where = $db.comment.user_id == $auth.id
  return = {
    type: "single"
  }
} as $my_published_posts
```

#### Return Count

Returns the number of matching records as an integer.

```xs
db.query "comment" {
  where = $db.comment.user_id == $auth.id
  return = {
    type: "count"
  }
} as $post_count
```

#### Return Exists

Returns whether any matching records exist as a boolean.

```xs
db.query "comment" {
  where = $db.comment.user_id == $auth.id
  return = {
    type: "exists"
  }
} as $has_posts
```

### Other convenience query operations

#### db.get

Retrieving a single record by its primary key can be done using `db.get`:

```xs
db.get "follow" {
  field_name = "id"
  field_value = $input.follow_id
} as $follow_record
```

#### db.has

Checking for the existence of a record can be done using `db.has`:

```xs
db.has "category" {
  field_name = "id"
  field_value = $input.query
} as $category_exists
```

#### Modifying your table

Adding a new record can be done using `db.add`:

```xs
db.add "post" {
  data = {
    user_id  : $auth.id
    caption  : $input.caption
    image_url: $input.image_url
    status   : "draft"
  }
} as $new_post
```

Editing a record can be done using `db.patch` this is preferred method to update a record and when the payload is built dynamically since the data object also accepts a variable.

```xs
var $payload {
  value = {status: "active"}
}

conditional {
  if ($input.is_featured) {
    var.update $payload.featured {
      value = true
    }
  }

  else {
    var.update $payload.featured {
      value = false
    }
  }
}

db.patch cards {
  field_name = "id"
  field_value = $input.card_id
  data = $payload
} as $cards1
```

Editing a record can also be done using `db.edit`. This method does not accept a variable for the data object and requires the fields to be updated to be specified in place.

```xs
db.edit "post" {
  field_name = "id"
  field_value = $input.post_id
  data = {
    caption : input.value
    image_url: $input.image_url || $post.image_url
  }
} as $edited_post
```

Adding or editing (upsert) a record can be done using `db.add_or_edit`. In this case, if the `field_value` is empty, a new record will be created; otherwise, the existing record will be updated.

```xs
db.add_or_edit "category" {
  field_name = "name"
  field_value = "$input.category"
  data = {
    name: $input.name
  }
} as $category_record
```

#### db.del

Deleting a record can be done using `db.del` (notice how delete does not return the deleted record):

```xs
db.del "post" {
  field_name = "id"
  field_value = $input.post_id
}
```


# Expressions and Filters

Filters, operators, and data transformations available in XanoScript expressions.

# XanoScript Expression Guidelines

This document provides a complete reference for all XanoScript expressions. Each entry includes a description, usage example, and expected result.

These expressions can be combined using the pipe `|` operator to create powerful data transformations.

```xs
var $foo {
  value = (10|add:5)|mul:2  # Result: 30
}
```

or applied on returned values

```xs
db.query "users" {
  ...
} as $username|first|get:"name"|to_upper
```

## Comparison

Comparison operators are used to compare two values. The result of a comparison is a boolean value, either `true` or `false`.

- **Example**: `$a == $b` → `true` if `$a` is equal to `$b`, `false` otherwise.
- **Example**: `$a != $b` → `true` if `$a` is not equal to `$b`, `false` otherwise.
- **Example**: `$a > $b` → `true` if `$a` is greater than `$b`, `false` otherwise.
- **Example**: `$a < $b` → `true` if `$a` is less than `$b`, `false` otherwise.
- **Example**: `$a >= $b` → `true` if `$a` is greater than or equal to `$b`, `false` otherwise.
- **Example**: `$a <= $b` → `true` if `$a` is less than or equal to `$b`, `false` otherwise.

```xs
var $is_equal {
  value = $input.a == $input.b
}
```

Comparison operators can be combined with additional expressions for more complex logic. When combining expressions, use parentheses to ensure the correct order of operations so filters are applied as intended.

```xs
var $is_greater {
  value = ($input.a|floor) > ($input.b|rad2deg|ceil)
}
```

Expressions can also be used in conditionals

```xs
conditional {
  if ($input.status == "active" && $input.age > 18) {
    debug.log { value = "Active adult" }
  } elseif ($input.status == "active" && $input.age <= 18) {
    debug.log { value = "Active minor" }
  } elseif ($input.status == "inactive" && $input.age > 18) {
    debug.log { value = "Inactive adult" }
  } else {
    debug.log { value = "Inactive minor" }
  }
}
```

## Math Expressions

- **deg2rad**  
  Convert degrees to radians.  
  Example: `180|deg2rad`  
  Result: `3.141592...`

- **rad2deg**  
  Convert radians to degrees.  
  Example: `3.141592|rad2deg`  
  Result: `180`

- **number_format**  
  Format a number with decimal and thousands separators.  
  Example: `31253212.141592|number_format:2:.:,`  
  Result: `"31,253,212.14"`

- **sin**  
  Calculates the sine of the supplied value in radians.  
  Example: `3.14159|sin`  
  Result: `0`

- **asin**  
  Calculates the arc sine of the supplied value in radians.  
  Example: `1|asin`  
  Result: `1.57079...`

- **asinh**  
  Calculates the inverse hyperbolic sine of the supplied value in radians.  
  Example: `1|asinh`  
  Result: `0.88137...`

- **cos**  
  Calculates the cosine of the supplied value in radians.  
  Example: `1|cos`  
  Result: `0.54030...`

- **acos**  
  Calculates the arc cosine of the supplied value in radians.  
  Example: `1|acos`  
  Result: `0`

- **acosh**  
  Calculates the inverse hyperbolic cosine of the supplied value in radians.  
  Example: `11.592|acosh`  
  Result: `3.14159...`

- **tan**  
  Calculates the tangent of the supplied value in radians.  
  Example: `0.785398|tan`  
  Result: `1`

- **atan**  
  Calculates the arc tangent of the supplied value in radians.  
  Example: `1|atan`  
  Result: `0.78539...`

- **atanh**  
  Calculates the inverse hyperbolic tangent of the supplied value in radians.  
  Example: `0.6666|atanh`  
  Result: `0.80470...`

- **floor**  
  Round a decimal down to its integer equivalent.  
  Example: `2.5|floor`  
  Result: `2`

- **ceil**  
  Round a decimal up to its integer equivalent.  
  Example: `2.5|ceil`  
  Result: `3`

- **round**  
  Round a decimal with optional precision.  
  Example: `2.5432|round:1`  
  Result: `3`

- **abs**  
  Returns the absolute value.  
  Example: `-10|abs`  
  Result: `10`

- **sqrt**  
  Returns the square root of the value.  
  Example: `9|sqrt`  
  Result: `3`

- **exp**  
  Returns the exponent of mathematical expression "e".  
  Example: `0|exp`  
  Result: `1`

- **log**  
  Returns the logarithm with a custom base.  
  Example: `2|log:2`  
  Result: `1`

- **log10**  
  Returns the Base-10 logarithm.  
  Example: `100|log10`  
  Result: `2`

- **ln**  
  Returns the natural logarithm.  
  Example: `10|ln`  
  Result: `2.30258...`

- **pow**  
  Returns the value raised to the power of exp.  
  Example: `10|pow:2`  
  Result: `100`

- **min**  
  Returns the min of the values of the array.  
  Example: `[1,2,3]|array_min`  
  Result: `1`

- **max**  
  Returns the max of the values of the array.  
  Example: `[1,2,3]|max`  
  Result: `3`

- **min**  
  Returns the min both values.  
  Example: `1|min:0`  
  Result: `0`

- **max**  
  Returns the max both values.  
  Example: `5|max:20`  
  Result: `20`

- **sum**  
  Returns the sum of the values of the array.  
  Example: `[1,2,3,4]|sum`  
  Result: `10`

- **avg**  
  Returns the average of the values of the array.  
  Example: `[1,2,3,4]|avg`  
  Result: `2.5`

- **product**  
  Returns the product of the values of the array.  
  Example: `[1,2,3,4]|product`  
  Result: `24`

- **add**  
  Add 2 values together and return the answer.  
  Example: `2|add:3`  
  Result: `5`

- **subtract**  
  Subtract 2 values together and return the answer.  
  Example: `2|subtract:3`  
  Result: `-1`

- **multiply**  
  Multiply 2 values together and return the answer.  
  Example: `2|multiply:3`  
  Result: `6`

- **modulus**  
  Modulus 2 values together and return the answer.  
  Example: `20|modulus:3`  
  Result: `2`

- **divide**  
  Divide 2 values together and return the answer.  
  Example: `20|divide:4`  
  Result: `5`

- **bitwise_and**  
  Bitwise AND 2 values together and return the answer.  
  Example: `7|bitwise_and:3`  
  Result: `3`

- **bitwise_or**  
  Bitwise OR 2 values together and return the answer.  
  Example: `7|bitwise_or:9`  
  Result: `15`

- **bitwise_xor**  
  Bitwise XOR 2 values together and return the answer.  
  Example: `7|bitwise_xor:9`  
  Result: `14`

## Array Expressions

- **first**  
  Get the first entry of an array.  
  Example: `["five","six","seven"]|first`  
  Result: `"five"`

- **last**  
  Get the last entry of an array.  
  Example: `["five","six","seven"]|last`  
  Result: `"seven"`

- **count**  
  Return the number of items in an object/array.  
  Example: `["five","six","seven"]|count`  
  Result: `3`

- **range**  
  Returns array of values between the specified start/stop.  
  Example: `|range:10:15`  
  Result: `[10,11,12,13,14,15]`

- **reverse**  
  Returns values of an array in reverse order.  
  Example: `[12,13,14,15]|reverse`  
  Result: `[15,14,13,12]`

- **unique**  
  Returns unique values of an array.  
  Example: `[12,13,13,12,11]|unique`  
  Result: `[12,13,11]`

- **safe_array**  
  Always returns an array. Uses the existing value if it is an array or creates an array of one element.  
  Example: `12|safe_array`  
  Result: `[12]`

- **flatten**  
  Flattens a multidimensional array into a single level array of values.  
  Example: `[1,[2,3],[[4,5]]]|flatten`  
  Result: `[1,2,3,4,5]`

- **filter_empty**  
  Returns a new array with only entries that are not empty ("", null, 0, "0", false, [], {}).  
  Example: `[{a:1, b:null}, {a:0, b:4}]|filter_empty:a`  
  Result: `[{a:1, b:null}]`

- **sort**  
  Sort an array of elements with an optional path inside the element.  
  Example: `[{v:"a", e:20}, {v:"z", e:10}]|sort:v:text:true`  
  Result: `[{v:"z", e:10}, {v:"a", e:20}]`

- **shuffle**  
  Shuffles the order of the entries in the array.  
  Example: `[1,2,3,4]|shuffle`  
  Result: `[3,2,4,1]`

- **diff**  
  Return the entries from the first array that are not in the second array. Only values are used for matching.  
  Example: `[1,2,3,4]|diff:[3,2]`  
  Result: `[1,4]`

- **diff_assoc**  
  Return the entries from the first array that are not in the second array. Values and keys are used for matching.  
  Example: `[{"a": "green"},{"b": "brown"},{"c":"blue"},"red"]|diff_assoc:[{"a":"green"}, "yellow", "red"]`  
  Result: `[{a: "green",b: "brown", "red"]`

- **intersect**  
  Return the entries from the first array that are also present in the second array. Only values are used for matching.  
  Example: `[1,2,3,4]|intersect:[3,2]`  
  Result: `[2,3]`

- **intersect_assoc**  
  Return the entries from the first array that are also present in the second array. Values and keys are used for matching.  
  Example: `[{"a": "green"},{"b": "brown"},{"c":"blue"},"red"]|intersect_assoc:[{"a":"green"},{"b":"yellow"},"blue","red"]`  
  Result: `[{a: "green",b: "brown", "red"]`

- **merge**  
  Merge the first level of elements of both arrays together and return the new array.  
  Example: `[1,2,3]|merge:["a","b","c"]`  
  Result: `[1,2,3,"a","b","c"]`

- **merge_recursive**  
  Merge the elements from all levels of both arrays together and return the new array.  
  Example: `{color:{favorite: ["red"]}}|merge_recursive:{color: {favorite: ["green","blue"]}}`  
  Result: `{"color":{"favorite": ["red","green","blue"]}}`

- **index_by**  
  Create a new array indexed off of the value of each item's path.  
  Example: `[{id:1,g:"x"},{id:2,g:"y"},{id:3,g:"x"}]|index_by:g`  
  Result: `{"x": [{"id":1,"g":"x"},{"id":3,"g":"x"}], "y": [{"id":2,"g":"y"}]}`

- **push**  
  Push an element on to the end of an array and return the new array.  
  Example: `[1,2,3]|push:"a"`  
  Result: `[1,2,3,"a"]`

- **pop**  
  Pops the last element of the array off and returns it.  
  Example: `[1,2,3]|pop`  
  Result: `3`

- **unshift**  
  Push an element to the beginning of an array and return the new array.  
  Example: `[1,2,3]|unshift:0`  
  Result: `[0,1,2,3]`

- **shift**  
  Shifts the first element of the array off and returns it.  
  Example: `[1,2,3]|shift`  
  Result: `1`

- **remove**  
  Remove any elements from the array that match the supplied value and then return the new array.  
  Example: `[{v:1},{v:2},{v:3}]|remove:{v:2}`  
  Result: `[{v:1},{v:3}]`

- **append**  
  Push an element on to the end of an array within an object and return the updated object.  
  Example: `[1,2,3]|append:4`  
  Result: `[1,2,3,4]`

- **prepend**  
  Push an element on to the beginning of an array within an object and return the updated object.  
  Example: `[1,2,3]|prepend:0`  
  Result: `[0,1,2,3]`

- **slice**  
  Extract a section from an array.  
  Example: `[1,2,3,4,5]|slice:2:2`  
  Result: `[3,4]`

- **map**  
  Creates a new array with the results of calling a provided function on every element in the calling array.  
  Example: `[{value: 2}, {value: 5}]|map:$$.value*2`  
  Result: `double each value => [4,10]`

- **filter**  
  Filters the elements of an array based on the code block returning true to keep the element or false to skip it.  
  Example: `[{value: 2}, {value: 5}]|filter:$$.value%2==0`  
  Result: `only even values => [{value:2}]`

- **some**  
  Checks if at least one element in the array passes the test implemented by the provided function.  
  Example: `[{value: 2}, {value: 5}]|some:$$.value%2==0`  
  Result: `at least one value is even => true`

- **every**  
  Checks if all elements in the array pass the test implemented by the provided function.  
  Example: `[{value: 2}, {value: 6}]|every:$$.value%2==0`  
  Result: `all values are even => true`

- **find**  
  Finds if all elements in the array pass the test implemented by the provided function.  
  Example: `[{id: 1}, {id: 2}, {id: 3}]|find:$$.id==2`  
  Result: `returns {id:2}`

- **findIndex**  
  Finds the index of the first element in the array that passes the test implemented by the provided function.  
  Example: `[{id: 1}, {id: 2}, {id: 3}]|findIndex:$$.id==2`  
  Result: `returns 1`

- **reduce**  
  Reduces the array to a single value using the code block to combine each element of the array.  
  Example: `[1,2,3,4,5]|reduce:$$+$result:10`  
  Result: `returns 25`

- **pick**  
  Pick keys from the object to create a new object of just those keys.  
  Example: `{a:1,b:2,c:3}|pick:[a,c]`  
  Result: `returns {a:1,c:3}`

- **unpick**  
  Remove keys from the object to create a new object of the remaining keys.  
  Example: `{a:1,b:2,c:3}|unpick:[a,c]`  
  Result: `returns {b:2}`

## String/Text Expressions

- **addslashes**  
  Adds a backslash to the following characters: single quote, double quote, backslash, and null character.  
  Example: `'he said "Hi!"'|addslashes`  
  Result: `"he said \\"Hi!\\""`

- **escape**  
  Converts special characters into their escaped variants. Ex: \t for tabs and \n for newlines.  
  Example: `'he said\n- "Hi!"'|escape`  
  Result: `"he said \\n-\\\"Hi!\\\""`

- **list_encodings**  
  List support character encodings.  
  Example: `|list_encodings`  
  Result: `["UTF-8", "ISO-8859-1", ...]`

- **detect_encoding**  
  Detect the character encoding of the supplied text.  
  Example: `"étude"|detect_encoding`  
  Result: `UTF-8`

- **to_utf8**  
  Convert the supplied text from its binary form (ISO-8859-1) to UTF-8.  
  Example: `"�tudes"|to_utf8`  
  Result: `"études"`

- **from_utf8**  
  Convert the supplied text from UTF-8 to its binary form (ISO-8859-1).  
  Example: `"études"|from_utf8`  
  Result: `"�tudes"`

- **convert_encoding**  
  Convert the character encoding of the supplied text.  
  Example: `"études"|convert_encoding:"ISO-8859-1":"UTF-8"`  
  Result: `"�tudes"`

- **to_lower**  
  Converts all characters to lower case and returns the result.  
  Example: `"Epic Battle"|to_lower`  
  Result: `"epic battle"`

- **to_upper**  
  Converts all characters to upper case and returns the result.  
  Example: `"Epic Battle"|to_upper`  
  Result: `"EPIC BATTLE"`

- **trim**  
  Trim whitespace or other characters from both sides and return the result.  
  Example: `"  Epic Battle  "|trim`  
  Result: `"Epic Battle"`

- **ltrim**  
  Trim whitespace or other characters from the left side and return the result.  
  Example: `"  Epic Battle  "|ltrim`  
  Result: `"Epic Battle  "`

- **rtrim**  
  Trim whitespace or other characters from the right return the result.  
  Example: `"  Epic Battle  "|rtrim`  
  Result: `"  Epic Battle"`

- **capitalize**  
  Converts the first letter of each word to a capital letter.  
  Example: `"epic battle"|capitalize`  
  Result: `"Epic Battle"`

- **substr**  
  Extracts a section of text.  
  Example: `"Epic Battle"|substr:5:6`  
  Result: `"Battle"`

- **split**  
  Splits text into an array of text and returns the result.  
  Example: `"Epic Battle"|split:" "`  
  Result: `["Epic","Battle"]`

- **join**  
  Joins an array into a text string via the separator and returns the result.  
  Example: `["Epic","Battle"]|join:" "`  
  Result: `"Epic Battle"`

- **array_slice**  
  Extract a section from an array.  
  Example: `[1,2,3,4,5]|array_slice:2:2`  
  Result: `[3,4]`

- **strlen**  
  Returns the number of characters.  
  Example: `"Epic Battle"|strlen`  
  Result: `11`

- **strip_html**  
  Removes HTML tags from a string.  
  Example: `"<p>Epic Battle</p>"|strip_html`  
  Result: `"Epic Battle"`

- **unaccent**  
  Removes accents from characters.  
  Example: `"études"|unaccent`  
  Result: `"etudes"`

- **index**  
  Returns the index of the case-sensitive expression or false if it can't be found.  
  Example: `"Epic Battle"|index:"Battle"`  
  Result: `5`

- **iindex**  
  Returns the index of the case-insensitive expression or false if it can't be found.  
  Example: `"Epic Battle"|iindex:"battle"`  
  Result: `5`

- **starts_with**  
  Returns whether or not the expression is present at the beginning.  
  Example: `"Epic Battle"|starts_with:"Epic"`  
  Result: `true`

- **istarts_with**  
  Returns whether or not the case-insensitive expression is present at the beginning.  
  Example: `"Epic Battle"|istarts_with:"epic"`  
  Result: `true`

- **ends_with**  
  Returns whether or not the expression is present at the end.  
  Example: `"Epic Battle"|ends_with:"Battle"`  
  Result: `true`

- **iends_with**  
  Returns whether or not the case-insensitive expression is present at the end.  
  Example: `"Epic Battle"|iends_with:"battle"`  
  Result: `true`

- **contains**  
  Returns whether or not the expression is found.  
  Example: `"Epic Battle"|contains:"Battle"`  
  Result: `true`

- **icontains**  
  Returns whether or not the case-insensitive expression is found.  
  Example: `"Epic Battle"|icontains:"battle"`  
  Result: `true`

- **concat**  
  Concatenates two values together.  
  Example: `"Hello" | concat:"World!":" - "`  
  Result: `"Hello - World!"`

- **sprintf**  
  Formats text with variable substitution.  
  Example: `"Hello %s, you have %d new messages"|sprintf:"Bob":5`  
  Result: `"Hello Bob, you have 5 new messages"`

- **replace**  
  Replace all occurrences of a text phrase with another.  
  Example: `"Hella World"|replace:"o":"a"`  
  Result: `"Hella Warld"`

- **regex_matches**  
  Tests if a regular expression matches the supplied subject text.  
  Example: `"/^a.*c$/"|regex_matches:"abbbbc"`  
  Result: `true`

- **regex_get_first_match**  
  Return the first set of matches performed by a regular expression on the supplied subject text.  
  Example: `"/(\\w+)@(\\w+).(\\w+)/"|regex_get_first_match:"test@example.com"`  
  Result: `["test@example.com","test","example","com"]`

- **regex_get_all_matches**  
  Return all matches performed by a regular expression on the supplied subject text.  
  Example: `"/\\b\\w+@\\w+.\\w+\\b/"|regex_get_all_matches:"test@example.com"`  
  Result: `[["test@example.com"]]`

- **regex_quote**  
  Update the supplied text value to be properly escaped for regular expressions.  
  Example: `"Hello. How are you?"|regex_quote:"/"`  
  Result: `"Hello\\. How are you\\?"`

- **regex_replace**  
  Perform a regular expression search and replace on the supplied subject text.  
  Example: `"/\\s+/"|regex_replace:"-":"Hello   World"`  
  Result: `"Hello-World"`

## Object/Manipulation Expressions

- **set**  
  Sets a value at the path within the object and returns the updated object.  
  Example: `{"fizz":"buzz"}|set:"foo":"bar"`  
  Result: `{"fizz": "buzz","foo":"bar"}`

- **set_conditional**  
  Sets a value at the path within the object and returns the updated object, if the conditional expression is true.  
  Example: `{'fizz':'buzz'}|set_conditional:'foo':'bar':2==1+1`  
  Result: `{'fizz':'buzz','foo':'bar'}`

- **set_ifnotempty**  
  Sets a value (if it is not empty: "", null, 0, "0", false, [], {}) at the path within the object and returns the updated object.  
  Example: `{'fizz':'buzz'}|set_ifnotempty:'foo':'bar'`  
  Result: `{'fizz':'buzz','foo':'bar'}`

- **set_ifnotnull**  
  Sets a value (if it is not null) at the path within the object and returns the updated object.  
  Example: `{'fizz':'buzz'}|set_ifnotnull:'foo':'bar'`  
  Result: `{'fizz':'buzz','foo':'bar'}`

- **first_notnull**  
  Returns the first value that is not null.  
  Example: `null|first_notnull:0`  
  Result: `0`

- **first_notempty**  
  Returns the first value that is not empty - i.e. not ("", null, 0, "0", false, [], {}).  
  Example: `""|first_notempty:1`  
  Result: `1`

- **unset**  
  Removes a value at the path within the object and returns the updated object.  
  Example: `{'fizz':'buzz','foo':'bar'}|unset:'foo'`  
  Result: `{'fizz':'buzz'}`

- **transform**  
   Processes an expression with local data bound to the $this variable.  
  Example: `2|transform:$$+3"` 
Result:`5`

- **get**  
  Returns the value of an object at the specified path.  
  Example: `{'fizz':'buzz'}|get:'fizz'`  
  Result: `"buzz"`

- **has**  
  Returns the existence of whether or not something is present in the object at the specified path.  
  Example: `{'fizz':'buzz'}|has:'fizz'`  
  Result: `true`

- **fill**  
  Create an array of a certain size with a default value.  
  Example: `"v"|fill:0:6`  
  Result: `["v","v","v","v","v","v"]`

- **fill_keys**  
  Create an array of keys with a default value.  
  Example: `key|fill_keys:["a","b","c"]`  
  Result: `{"a":"key","b":"key","c":"key"}`

- **keys**  
  Get the property keys of an object/array as a numerically indexed array.  
  Example: `{"a":1,"b":2,"c":3}|keys`  
  Result: `["a","b","c"]`

- **values**  
  Get the property values of an object/array as a numerically indexed array.  
  Example: `{"a":1,"b":2,"c":3}|values`  
  Result: `[1,2,3]`

- **entries**  
  Get the property entries of an object/array as a numerically indexed array of key/value pairs.  
  Example: `{"a":1,"b":2,"c":3}|entries`  
  Result: `[{key:"a",value:1},{key:"b",value:2},{key:"c",value:3}]`

- **create_object**  
  Creates an object based on a list of keys and a list of values.  
  Example: `["a","b","c"]|create_object:[1,2,3]`  
  Result: `{"a":1,"b":2,"c":3}`

- **create_object_from_entries**  
  Creates an object based on an array of key/value pairs. (i.e. same result as the entries filter).  
  Example: `[{key:"a",value:1},{key:"b",value:2},{key:"c",value:3}]|create_object_from_entries`  
  Result: `{"a":1,"b":2,"c":3}`

## Date/Time/Timestamp Expressions

- **to_timestamp**  
  Converts a text expression (now, next friday, Jan 1 2000) to timestamp compatible format.  
  Example: `"next friday"|to_timestamp:"America/Los_Angeles"`  
  Result: `1758265200000`

- **to_ms**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of milliseconds since the unix epoch.  
  Example: `"next friday"|to_ms:"America/Los_Angeles"`  
  Result: `1758265200000`

- **to_seconds**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of seconds since the unix epoch.  
  Example: `"next friday"|to_seconds:"America/Los_Angeles"`  
  Result: `1758265200`

- **to_minutes**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of minutes since the unix epoch.  
  Example: `"next friday"|to_minutes:"America/Los_Angeles"`  
  Result: `29304420`

- **to_hours**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of hours since the unix epoch.  
  Example: `"next friday"|to_hours:"America/Los_Angeles"`  
  Result: `488407`

- **to_days**  
  Converts a text expression (now, next friday, Jan 1 2000) to the number of days since the unix epoch.  
  Example: `"next friday"|to_days:"America/Los_Angeles"`  
  Result: `20350`

- **parse_timestamp**  
  Parse a timestamp from a flexible format.  
  Example: `"2023-08-15 13:45:30"|parse_timestamp:"Y-m-d H:i:s":"America/Los_Angeles"`  
  Result: `"1692132330000"`

- **format_timestamp**  
  Converts a timestamp into a human readable formatted date based on the supplied format.  
  Example: `"1692132330000"|format_timestamp:"Y-m-d H:i:s":"America/New_York"`  
  Result: `"2023-08-15 16:45:30"`

- **transform_timestamp**  
  Takes a timestamp and applies a relative transformation to it. Ex. -7 days, last Monday, first day of this month.  
  Example: `"2023-08-15T20:45:30.000Z"|transform_timestamp:"-7 days":"America/Los_Angeles"`  
  Result: `"1691527530000"`

- **add_secs_to_timestamp**  
  Add seconds to a timestamp. (negative values are ok)  
  Example: `1691527530000|add_secs_to_timestamp:60`  
  Result: `1691527590000`

- **add_ms_to_timestamp**  
  Add milliseconds to a timestamp. (negative values are ok)  
  Example: `monday|add_ms_to_timestamp:500`  
  Result: `1758499200500`

## Comparison/Logical Expressions

- **equals**  
  Returns a boolean if both values are equal.  
  Example: `4|equals:4`  
  Result: `true`

- **not_equals**  
  Returns a boolean if both values are not equal.  
  Example: `4|not_equals:4`  
  Result: `false`

- **greater_than**  
  Returns a boolean if the left value is greater than the right value.  
  Example: `4|greater_than:2`  
  Result: `true`

- **greater_than_or_equal**  
  Returns a boolean if the left value is greater than or equal to the right value.  
  Example: `4|greater_than_or_equal:2`  
  Result: `true`

- **less_than**  
  Returns a boolean if the left value is less than the right value.  
  Example: `4|less_than:2`  
  Result: `false`

- **less_than_or_equal**  
  Returns a boolean if the left value is less than or equal to the right value.  
  Example: `4|less_than_or_equal:2`  
  Result: `false`

- **odd**  
  Returns whether or not the value is odd.  
  Example: `4|odd`  
  Result: `false`

- **even**  
  Returns whether or not the value is even.  
  Example: `4|even`  
  Result: `true`

- **in**  
  Returns whether or not the value is in the array.  
  Example: `[1,2,3]|in:3`  
  Result: `true`

- **not**  
  Returns the opposite of the existing value evaluated as a boolean.  
  Example: `true|not`  
  Result: `false`

- **bitwise_not**  
  Returns the existing value with its bits flipped.  
  Example: `8|bitwise_not`  
  Result: `-9`

- **is_null**  
  Returns whether or not the value is null.  
  Example: `8|is_null`  
  Result: `false`

- **is_empty**  
  Returns whether or not the value is empty ("", null, 0, "0", false, [], {}).  
  Example: `[]|is_empty`  
  Result: `true`

- **is_object**  
  Returns whether or not the value is an object.  
  Example: `{id:2, value:3, size:4}|is_object`  
  Result: `true`

- **is_array**  
  Returns whether or not the value is a numerical indexed array.  
  Example: `[1,2,3]|is_array`  
  Result: `true`

- **is_int**  
  Returns whether or not the value is an integer.  
  Example: `123|is_int`  
  Result: `true`

- **is_decimal**  
  Returns whether or not the value is a decimal value.  
  Example: `123.45|is_decimal`  
  Result: `true`

- **is_bool**  
  Returns whether or not the value is a boolean.  
  Example: `false|is_bool`  
  Result: `true`

- **is_text**  
  Returns whether or not the value is text.  
  Example: `"213"|is_text`  
  Result: `true`

## Security/Crypto Expressions

- **encrypt**  
  Encrypts the value and returns the result in raw binary form.  
  Example: `"hello"|encrypt:"aes-192-cbc":"1494AX6XJUsDe51kF9S9sA==":"27222b6032574bad"`  
  Result: `"���Z �r|5���~�l"`

- **decrypt**  
  Decrypts the value and returns the result.  
  Example: `"...encrypted..."|decrypt:"aes-192-cbc":"1494AX6XJUsDe51kF9S9sA==":"27222b6032574bad"`  
  Result: `"hello"`

- **jws_encode**  
  Encodes the value and returns the result as a JWS token.  
  Example: `"hello"|jws_encode:{sub: "1234567890",name: "John Doe",admin: true,iat: 1516239022}:"a-string-secret-at-least-256-bits-long":HS256`  
  Result: `"...encrypted..."`

- **jws_decode**  
  Decodes the JWS token and returns the result.  
  Example: `"eyJzd...ZYw"|jws_decode:{}:"a-string-secret-at-least-256-bits-long":HS256`  
  Result: `"hello"`

- **jwe_encode**  
  Encodes the value and returns the result as a JWE token.  
  Example: `"hello"|jwe_encode:{sub: "1234567890",name: "John Doe",admin: true,iat: 1516239022}:"a-string-secret-at-least-256-bits-long":"A256KW":"A256CBC-HS512"`  
  Result: `"...encrypted..."`

- **jwe_decode**  
  Decodes the JWE token and returns the result.  
  Example: `"eyJ...Xw"|jwe_decode:{}:"a-string-secret-at-least-256-bits-long":"A256KW":"A256CBC-HS512"`  
  Result: `"hello"`

- **secureid_encode**  
  Returns an encrypted version of the id.  
  Example: `12345|secureid_encode:"my_salt"`  
  Result: `"ZlV3Lg.-0-UZyQ9xQk"`

- **secureid_decode**  
  Returns the id of the original encode.  
  Example: `"ZlV3Lg.-0-UZyQ9xQk"|secureid_decode:"my_salt"`  
  Result: `12345`

- **md5**  
  Returns a MD5 signature representation of the value.  
  Example: `"some_message"|md5`  
  Result: `"af8a2aae147de3350f6c0f1a075ede5d"`

- **sha1**  
  Returns a SHA1 signature representation of the value.  
  Example: `"some_message"|sha1`  
  Result: `"33a374032... (truncated) ..."`

- **sha256**  
  Returns a SHA256 signature representation of the value.  
  Example: `"some_message"|sha256`  
  Result: `"6cc869f10009fa1... (truncated) ..."`

- **sha384**  
  Returns a SHA384 signature representation of the value.  
  Example: `"some_message"|sha384`  
  Result: `"17a7717060650457... (truncated) ..."`

- **sha512**  
  Returns a SHA512 signature representation of the value.  
  Example: `"some_message"|sha512`  
  Result: `"40aaa4e84e7d98e472d240f1c84298de... (truncated) ..."`

- **hmac_md5**  
  Returns a MD5 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_md5:MY_SECRET_KEY`  
  Result: `"c4c1007ea935001cc7734b360395fb1d"`

- **hmac_sha1**  
  Returns a SHA1 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha1:MY_SECRET_KEY`  
  Result: `"83b48df25eda2... (truncated) ..."`

- **hmac_sha256**  
  Returns a SHA256 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha256:MY_SECRET_KEY`  
  Result: `"3e18fc78d5326e5... (truncated) ..."`

- **hmac_sha384**  
  Returns a SHA384 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha384:MY_SECRET_KEY`  
  Result: `"60818f7b6e6... (truncated) ..."`

- **hmac_sha512**  
  Returns a SHA512 signature representation of the value using a shared secret via the HMAC method.  
  Example: `"some_message"|hmac_sha512:MY_SECRET_KEY`  
  Result: `"880c17f6d5fa9e1ea3b7... (truncated) ..."`

- **create_uid**  
  Returns a unique 64bit unsigned int value seeded off the value.  
  Example: `|create_uid`  
  Result: `14567891234567890`

- **uuid**  
  Returns a universally unique identifier.  
  Example: `|uuid`  
  Result: `"550e8400-e29b-41d4-a716-446655440000"`

## Transform/Type Conversion Expressions

- **to_expr**  
  Converts text into an expression, processes it, and returns the result.  
  Example: `"(2 + 1) % 2"|to_expr`  
  Result: `1`

- **to_text**  
  Converts integer, decimal, or bool types to text and returns the result.  
  Example: `1.344|to_text`  
  Result: `"1.344"`

- **to_int**  
  Converts text, decimal, or bool types to an integer and returns the result.  
  Example: `"133.45 kg"|to_int`  
  Result: `133`

- **to_decimal**  
  Converts text, integer, or bool types to a decimal and returns the result.  
  Example: `"133.45 kg"|to_decimal`  
  Result: `133.45`

- **to_bool**  
  Converts text, integer, or decimal types to a bool and returns the result.  
  Example: `"true"|to_bool`  
  Result: `true`

- **json_decode**  
  Decodes the value represented as json and returns the result.  
  Example: `'{"a":1,"b":2,"c":3}'|json_decode`  
  Result: `{"a":1,"b":2,"c":3}`

- **json_encode**  
  Encodes the value and returns the result as json text.  
  Example: `{"a":1,"b":2,"c":3}|json_encode`  
  Result: `'{"a":1,"b":2,"c":3}'`

- **xml_decode**  
  Decodes XML and returns the result.  
  Example: `"<root><a>1</a><b>2</b><c>3</c></root>"|xml_decode`  
  Result: `{ "root": { "@attributes": [], "value": [ { "a": { "@attributes": [], "value": "1" } }, { "b": { "@attributes": [], "value": "2" } } ] } }`

- **yaml_decode**  
  Decodes the value represented as yaml and returns the result.  
  Example: `"a: 1\nb: 2\nc: 3"|yaml_decode`  
  Result: `{"a":1,"b":2,"c":3}`

- **yaml_encode**  
  Encodes the value and returns the result as yaml text.  
  Example: `{"a":1,"b":2,"c":3}|yaml_encode`  
  Result: `'a: 1\nb: 2\nc: 3\n'`

- **hex2bin**  
  Converts a hex value into its binary equivalent.  
  Example: `"68656c6c6f"|hex2bin`  
  Result: `"hello"`

- **bin2hex**  
  Converts a binary value into its hex equivalent.  
  Example: `"hello"|bin2hex`  
  Result: `"68656c6c6f"`

- **dechex**  
  Converts a decimal value into its hex equivalent.  
  Example: `"255"|dechex`  
  Result: `"ff"`

- **hexdec**  
  Converts a hex value into its decimal equivalent.  
  Example: `"ff"|hexdec`  
  Result: `"255"`

- **decbin**  
  Converts a decimal value into its binary string (i.e. 01010) equivalent.  
  Example: `"10"|decbin`  
  Result: `"1010"`

- **bindec**  
  Converts a binary string (i.e. 01010) into its decimal equivalent.  
  Example: `"1010"|bindec`  
  Result: `"10"`

- **decoct**  
  Converts a decimal value into its octal equivalent.  
  Example: `"10"|decoct`  
  Result: `"12"`

- **octdec**  
  Converts an octal value into its decimal equivalent.  
  Example: `"12"|octdec`  
  Result: `"10"`

- **base_convert**  
  Converts a value between two bases.  
  Example: `"ff"|base_convert:16:10`  
  Result: `"255"`

- **base64_decode**  
  Decodes the value represented as base64 text and returns the result.  
  Example: `"aGVsbG8="|base64_decode`  
  Result: `"hello"`

- **base64_encode**  
  Encodes the value and returns the result as base64 text.  
  Example: `"hello"|base64_encode`  
  Result: `"aGVsbG8="`

- **base64_decode_urlsafe**  
  Decodes the value represented as base64 urlsafe text and returns the result.  
  Example: `"aGVsbG8_"|base64_decode_urlsafe`  
  Result: `"hello?"`

- **base64_encode_urlsafe**  
  Encodes the value and returns the result as base64 urlsafe text.  
  Example: `"hello?"|base64_encode_urlsafe`  
  Result: `"aGVsbG8_"`

- **url_decode**  
  Decodes the value represented as a url encoded value.  
  Example: `"Hello%2C%20World%21"|url_decode`  
  Result: `"Hello, World!"`

- **url_decode_rfc3986**  
  Decodes the value represented as a url encoded value using the RFC 3986 specification.  
  Example: `"Hello%2C%20World%21"|url_decode_rfc3986`  
  Result: `"Hello, World!"`

- **url_encode**  
  Encodes the value and returns the result as a url encoded value.  
  Example: `"Hello, World!"|url_encode`  
  Result: `"Hello%2C%20World%21"`

- **url_encode_rfc3986**  
  Encodes the value and returns the result as a url encoded value using the RFC 3986 specification.  
  Example: `"Hello, World!"|url_encode_rfc3986`  
  Result: `"Hello%2C%20World%21"`


# Function Integration

How to call reusable functions from within tasks using `function.run`.

## Function Structure

A function file consists of:

- The function name (e.g., `calculate_total`, `utilities/parse_email`)
- An optional `description` field
- An `input` block defining parameters
- A `stack` block containing the logic to execute
- A `response` block specifying the output

## Example Function

```xs
function "maths/calculate_total" {
  description = "Calculate the total cost based on quantity and price per item"

  input {
    int quantity filters=min:0 {
      description = "Number of items"
    }

    decimal price_per_item filters=min:0.01 {
      description = "Price for each item"
    }
  }

  stack {
    var $total {
      value = 0
      description = "Initialize total"
    }

    math.add $total {
      value = $input.quantity * $input.price_per_item
      description = "Calculate total"
    }
  }

  response = $total
}
```

## How to call a function in your code

You can call a function using the `function.run` keyword followed by the function's name.

**Example:**

```xs
function.run "maths/calculate_total" {
  input = {
    quantity: 5,
    price_per_item: 20
  }
} as $result
```

## Input Block

The `input` block defines the parameters your function expects. You can specify:

- Data types (`int`, `text`, `decimal`, etc.)
- Optional fields (add `?`)
- Filters (e.g., `trim`, `lower`)
- Metadata (`description`, `sensitive`)

**Example:**

```xs
input {
  text username filters=trim {
    description = "User's login name"
  }

  text email filters=trim {
    description = "User's email address"
  }

  date dob? {
    description = "User's date of birth (YYYY-MM-DD)"
    sensitive = true
  }
}
```

## Stack Block

The `stack` block contains the logic for your function, such as:

- Variable declarations (`var`)
- Control flow (`conditional`, `for`, `foreach`)
- Function calls (`math.add`, `debug.log`)
- Database operations (`db.query`, `db.add`)
- Error handling (`throw`, `try_catch`)

## Response Block

The `response` block defines what your function returns. The value can be a variable, object, or expression.

**Example:**

```xs
response = $total
```

## Best Practices

- Use `description` for documentation.
- Validate inputs with `filters=...` first, fallback on `precondition` or `conditional` blocks.
- Place all logic inside the `stack` block.
- Always define a `response` block for output.
- Organize functions in subfolders for clarity.

## Summary

- Place functions in the `functions` folder.
- Use `input` for parameters.
- Use `stack` for logic.
- Use `response` for output.
- Document your function with `description` fields.

For more examples, see the documentation or sample functions in your project.


## Task Structure

A task file must be placed in the `tasks/` folder and follows this structure:

```xs
task "<name>" {
  description = "What this task does and when it runs"

  stack {
    // Processing logic: variables, conditionals, loops, database operations
  }

  schedule = [{starts_on: YYYY-MM-DD HH:MM:SS+0000, freq: <seconds>}]

  history = "inherit"  // Optional: enable audit trail
}
```

## Key Differences from Functions

| Aspect       | Task                   | Function                     |
| ------------ | ---------------------- | ---------------------------- |
| **Trigger**  | Scheduled (cron-like)  | Called explicitly            |
| **Input**    | None (use `$env` vars) | Parameters via `input` block |
| **Output**   | None (fire-and-forget) | Returns via `response` block |
| **Location** | `tasks/` folder        | `functions/` folder          |

## Schedule Configuration

The `schedule` block defines when the task runs using an events array:

```xs
schedule = [{starts_on: 2026-05-01 00:00:00+0000, freq: 86400}]
```

### Common Frequencies

| Interval           | Seconds   |
| ------------------ | --------- |
| Hourly             | `3600`    |
| Every 6 hours      | `21600`   |
| Daily              | `86400`   |
| Weekly             | `604800`  |
| Monthly (~30 days) | `2592000` |

### Schedule Options

- `starts_on` - UTC timestamp when the task starts (format: `YYYY-MM-DD HH:MM:SS+0000`)
- `freq` - Frequency in seconds (minimum 3600 for hourly)
- `ends_on` - Optional cutoff timestamp

## Stack Operations

Tasks use the same stack operations as functions:

### Variables

```xs
var $current_time {
  value = now
  description = "Current timestamp for comparison"
}
```

### Database Operations

```xs
db.query "users" {
  description = "Find inactive users"
  where = $db.users.last_login < $threshold
} as $inactive_users

db.edit "users" {
  field_name = "id"
  field_value = $user.id
  data = {is_active: false}
} as $result

db.del "sessions" {
  field_name = "id"
  field_value = $session.id
}

db.add "reports" {
  data = {report_type: "daily", created_at: now}
} as $new_report
```

### Control Flow

```xs
foreach ($items) {
  each as $item {
    // Process each item
  }
}

conditional {
  if ($count > 0) {
    // Handle non-empty case
  } else {
    // Handle empty case
  }
}
```

### Error Handling

```xs
try_catch {
  try {
    api.request {
      url = "https://api.example.com/endpoint"
      method = "POST"
      data = {key: $value}
    } as $response
  }
  catch {
    debug.log {
      value = "API call failed: " ~ $error.message
      description = "Log error"
    }
  }
}
```

### Logging

```xs
debug.log {
  value = "Task completed successfully"
  description = "Log task completion"
}

// Structured logging with objects
debug.log {
  value = {
    processed: $count
    status: "complete"
  }
  description = "Log task metrics"
}
```

### Calling Functions

```xs
function.run "utilities/send_notification" {
  input = {
    message: "Daily report generated"
    channel: "slack"
  }
} as $notification_result
```

## Common Patterns

### Data Cleanup Task

```xs
task "cleanup_expired_sessions" {
  description = "Clean up expired sessions every 6 hours"

  stack {
    var $current_time {
      value = now
      description = "Get current timestamp"
    }

    db.query "sessions" {
      description = "Find expired sessions"
      where = $db.sessions.expires_at < $current_time
    } as $expired_sessions

    foreach ($expired_sessions) {
      each as $session {
        db.del "sessions" {
          field_name = "id"
          field_value = $session.id
          description = "Delete expired session"
        }
      }
    }

    debug.log {
      value = "Cleaned up " ~ ($expired_sessions|count) ~ " expired sessions"
      description = "Log cleanup results"
    }
  }

  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 21600}]
  history = "inherit"
}
```

### Daily Report Task

```xs
task "daily_sales_report" {
  description = "Generate daily sales report at midnight UTC"

  stack {
    var $yesterday {
      value = now|transform_timestamp:"24 hours ago":"UTC"
      description = "Calculate yesterday's date"
    }

    db.query "orders" {
      description = "Get yesterday's orders"
      where = $db.orders.created_at >= $yesterday
    } as $orders

    var $total_sales {
      value = ($orders[$$].amount)|sum
      description = "Calculate total sales"
    }

    db.add "reports" {
      data = {
        report_type: "daily_sales"
        report_date: now
        total_amount: $total_sales
        order_count: ($orders|count)
      }
      description = "Save daily report"
    } as $report

    debug.log {
      value = {
        report_id: $report.id
        total_sales: $total_sales
        order_count: ($orders|count)
      }
      description = "Log report creation"
    }
  }

  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 86400}]
  history = "inherit"
}
```

### API Integration Task

```xs
task "sync_external_data" {
  description = "Sync data from external API every hour"

  stack {
    try_catch {
      description = "Fetch and process external data"
      try {
        api.request {
          url = "https://api.example.com/data"
          method = "GET"
          headers = {Authorization: "Bearer " ~ $env.api_token}
          description = "Fetch external data"
        } as $api_response

        foreach ($api_response.response.result.items) {
          each as $item {
            db.add "synced_items" {
              data = {
                external_id: $item.id
                name: $item.name
                synced_at: now
              }
              description = "Save synced item"
            }
          }
        }

        debug.log {
          value = "Synced " ~ ($api_response.response.result.items|count) ~ " items"
          description = "Log sync completion"
        }
      }
      catch {
        debug.log {
          value = {
            error: $error.message
            code: $error.code
          }
          description = "Log sync failure"
        }
      }
    }
  }

  schedule = [{starts_on: 2026-01-01 00:00:00+0000, freq: 3600}]
  history = "inherit"
}
```

## Best Practices

1. **Always use descriptions** - Document the task purpose and each operation
2. **Use `history = "inherit"`** - Enable audit trails for monitoring
3. **Wrap risky operations in `try_catch`** - Handle API calls and external dependencies gracefully
4. **Log start, progress, and completion** - Use `debug.log` for monitoring
5. **Use UTC timestamps** - All `starts_on` times should be in UTC
6. **Design for idempotency** - Tasks may run multiple times; handle duplicates
7. **Use environment variables** - Access secrets via `$env.key_name`
8. **Paginate large datasets** - Avoid processing >10k items in one loop
9. **Use transactions for atomic operations** - Wrap related DB operations in `db.transaction`
10. **Check for errors** - Use #tool:get_errors to verify your code has no syntax or validation errors after making changes

## History Options

- `history = "inherit"` - Log task runs to the database
- `history = 1000` - Keep last 1000 execution records
- Omit for no history tracking
