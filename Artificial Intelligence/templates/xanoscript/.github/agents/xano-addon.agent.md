---
description: Write XanoScript addons to fetch related data for database queries
name: Xano Addon Writer
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

You are an expert at writing XanoScript addons. Your role is to help developers create efficient addons that fetch related data for database query results.

# Database Query Guidelines

Complete guide to querying databases with `db.query`, including addons, joins, sorting, and pagination.

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


# API Query Examples

Real-world examples showing how addons are used in API endpoints to fetch related data efficiently.

## blog_posts_list

```xs
query "blog_posts" verb=GET {
  api_group = "blog"
  description = "Returns a paginated list of all blog posts with paging and sorting capabilities. Includes author information, comment counts, and like counts for each post."
  input {
    int page?=1 {
      description = "Page number for pagination"
    }

    int per_page?=10 {
      description = "Number of items per page (max 100)"
    }

    json sort? {
      description = "External sorting configuration array with orderBy and sortBy fields"
    }
  }

  stack {
    db.query blog_post {
      join = {
        user: {
          table: "user"
          where: $db.blog_post.author_id == $db.user.id
        }
      }

      sort = {blog_post.publication_date: "desc"}
      override_sort = $input.sort
      eval = {authorName: $db.user.name, status: $db.user.status}
      return = {
        type  : "list"
        paging: {
          page    : $input.page
          per_page: $input.per_page
          totals  : true
        }
      }

      addon = [
        {
          name : "blog_post_likes"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_likes"
        }
        {
          name : "blog_post_comments"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_comments"
        }
      ]
    } as $posts
  }

  response = $posts

  history = false
}
```

## review_by_product

```xs
query "reviews/by_product/{product_id}" verb=GET {
  api_group = "reviews"
  description = "Retrieve all reviews for a given product with optional minimum rating, sorted by review_date descending, and paginated."
  input {
    int product_id {
      description = "ID of the product to filter reviews"
    }

    decimal min_rating? {
      description = "Optional minimum rating to filter reviews"
    }
  }

  stack {
    debug.log {
      value = "Requester IP: " ~ $env.$remote_ip
    }

    conditional {
      if ($input.min_rating != null) {
        db.query "product_reviews" {
          where = $db.product_reviews.product_id == $input.product_id && $db.product_reviews.rating >= $input.min_rating
          sort = {product_reviews.review_date: "desc"}
          return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
        } as $reviews
      }

      else {
        db.query "product_reviews" {
          where = $db.product_reviews.product_id == $input.product_id
          sort = {product_reviews.review_date: "desc"}
          return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
        } as $reviews
      }
    }
  }

  response = $reviews

  history = 100
}
```

## last_five_blog_posts

```xs
query "posts/recent" verb=GET {
  description = "Retrieve the 5 most recent published blog posts, sorted by publication_date in descending order."
  input {
  }

  stack {
    db.query "blog_post" {
      where = $db.blog_post.is_draft == false
      sort = {blog_post.publication_date: "desc"}
      return = {
        type  : "list"
        paging: {page: 1, per_page: 5, metadata: false}
      }
    } as $recent_posts
  }

  response = $recent_posts

  history = "inherit"
}
```

## booking_reservation_system

```xs
query "create_booking" verb=POST {
  description = "Create a new booking reservation with availability checking and conflict resolution"
  auth = "user"
  input {
    int resource_id filters=min:1 {
      description = "ID of the resource to book"
    }

    text title filters=trim|min:1 {
      description = "Title or purpose of the booking"
    }

    text description? filters=trim {
      description = "Detailed description of the booking purpose"
    }

    timestamp start_time {
      description = "When the booking should begin (ISO format)"
    }

    timestamp end_time {
      description = "When the booking should end (ISO format)"
    }

    int attendee_count?=1 filters=min:1 {
      description = "Number of people attending (default: 1)"
    }

    email contact_email {
      description = "Contact email for booking notifications"
    }

    text contact_phone? filters=trim {
      description = "Contact phone number"
    }

    text special_requests? filters=trim {
      description = "Any special requirements or requests"
    }

    bool send_confirmation?=1 {
      description = "Whether to send email confirmation (default: true)"
    }
  }

  stack {
    precondition ($input.start_time < $input.end_time) {
      description = "Validate booking time range is logical"
      error_type = "inputerror"
      error = "Start time must be before end time."
    }

    precondition ($input.start_time > now) {
      description = "Validate booking is not in the past"
      error_type = "inputerror"
      error = "Cannot create bookings in the past."
    }

    db.query "resources" {
      description = "Get the resource being booked"
      where = $db.resources.id == $input.resource_id && $db.resources.is_active
      return = {type: "list"}
    } as $resource_data

    precondition (($resource_data|count) > 0) {
      description = "Validate resource exists and is active"
      error_type = "inputerror"
      error = "Resource not found or is not available for booking."
    }

    var $resource {
      description = "Store the resource record"
      value = $resource_data|first
    }

    precondition ($input.attendee_count <= $resource.capacity) {
      description = "Validate attendee count does not exceed resource capacity"
      error_type = "inputerror"
      error = "Attendee count (" ~ $input.attendee_count ~ ") exceeds resource capacity (" ~ $resource.capacity ~ ")."
    }

    db.query "bookings" {
      description = "Get all existing bookings for this resource to check conflicts"
      where = $db.bookings.resource_id == $input.resource_id
      return = {type: "list"}
    } as $all_bookings

    var $existing_bookings {
      description = "Filter bookings to only confirmed or pending ones"
      value = $all_bookings|filter:($this.status == "confirmed" || $this.status == "pending")
    }

    var $conflicts {
      description = "Find conflicting bookings that overlap with requested time"
      value = $existing_bookings|filter:(($this.start_time < $input.end_time) && ($this.end_time > $input.start_time))
    }

    precondition (($conflicts|count) == 0) {
      description = "Validate no time conflicts exist"
      error_type = "inputerror"
      error = "Time slot conflicts with existing booking. Please choose a different time."
    }

    var $booking_duration {
      description = "Calculate booking duration in hours"
      value = ($input.end_time - $input.start_time) / 3600
    }

    var $total_cost {
      description = "Calculate total cost based on hourly rate and duration"
      value = $booking_duration * $resource.hourly_rate
    }

    var $booking_reference {
      description = "Generate unique booking reference code"
      value = "BK-" ~ $input.resource_id ~ "-" ~ (now|to_timestamp) ~ "-" ~ ($auth.id|to_text)
    }

    var $initial_status {
      description = "Set initial status based on whether resource requires approval"
      value = ($resource.requires_approval == true) ? "pending" : "confirmed"
    }

    db.add bookings {
      description = "Create the new booking record"
      data = {
        resource_id      : $input.resource_id
        user_id          : $auth.id
        title            : $input.title
        description      : $input.description
        start_time       : $input.start_time
        end_time         : $input.end_time
        attendee_count   : $input.attendee_count
        contact_email    : $input.contact_email
        contact_phone    : $input.contact_phone
        status           : $initial_status
        total_cost       : $total_cost
        special_requests : $input.special_requests
        booking_reference: $booking_reference
        created_at       : now
        updated_at       : now
      }
    } as $new_booking

    conditional {
      description = "Send confirmation email if requested"
      if ($input.send_confirmation) {
        var $email_subject {
          description = "Create email subject line"
          value = "Booking Confirmation - " ~ $resource.name ~ " (" ~ $booking_reference ~ ")"
        }

        util.template_engine {
          description = "Create email body using template"
          value = """
            Dear Customer,

            Your booking has been {{ initial_status == 'confirmed' ? 'confirmed' : 'submitted for approval' }}.

            Booking Details:
            - Resource: {{ resource.name }}
            - Date/Time: {{ input.start_time }} - {{ input.end_time }}
            - Duration: {{ booking_duration }} hours
            - Attendees: {{ input.attendee_count }}
            - Total Cost: ${{ total_cost }}
            - Reference: {{ booking_reference }}

            Thank you for your booking!
            """
        } as $email_body

        util.send_email {
          description = "Send booking confirmation email to user"
          service_provider = "resend"
          api_key = $env.secret_key
          from = "no-reply@example.com"
          to = $input.contact_email
          subject = $email_subject
          message = $email_body
        } as $confirmation_email
      }
    }

    var $booking_result {
      description = "Prepare booking result summary"
      value = {
        booking_id: $new_booking.id
        booking_reference: $booking_reference
        resource_name: $resource.name
        status: $initial_status
        start_time: $input.start_time
        end_time: $input.end_time
        duration_hours: $booking_duration
        total_cost: $total_cost
        requires_approval: $resource.requires_approval
        confirmation_sent: $input.send_confirmation
      }
    }

    debug.log {
      description = "Log successful booking creation"
      value = {
        action: "booking_created_successfully"
        booking_id: $new_booking.id
        booking_reference: $booking_reference
        status: $initial_status
        total_cost: $total_cost
      }
    }
  }

  response = $booking_result

  history = "all"
}
```

## audio_transcription_endpoint

```xs
query "transcribe/audio" verb=POST {
  auth = "user"
  api_group = "media"
  description = "Upload an audio file to be transcribed using ElevenLabs API, store the file in cloud storage, and save transcription in the database."

  input {
    file audio {
      description = "Audio file to be transcribed"
    }

    text ?language {
      description = "Target language for transcription (optional, auto-detect if not provided)"
    }

    text access_level?=private filters=trim {
      description = "Access level for the audio file (public or private)"
    }
  }

  stack {
    try_catch {
      try {
        conditional {
          if ($input.access_level == "public") {
            storage.create_attachment {
              value = $input.audio
              access = "public"
              filename = $filename
              description = "Store audio in cloud storage as public"
            } as $audio_storage
          }

          else {
            return {
              value = "This function is built for public files. Please set access_level to public"
            }
          }
        }
      }

      catch {
        throw {
          name = "Audio file issue"
          value = ""
        }
      }
    }

    group {
      description = "Handle audio upload and transcription process"
      stack {
        db.get "user" {
          field_name = "id"
          field_value = $auth.id
          description = "Verify user exists"
        } as $user

        conditional {
          if ($user == "") {
            throw {
              name = "inputerror"
              value = "Invalid user ID provided."
            }
          }
        }

        var $allowed_audio_types {
          value = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/aac", "audio/ogg", "audio/flac"]
          description = "List of allowed audio MIME types"
        }

        var $file_mime {
          value = $audio_storage.mime
          description = "MIME type of uploaded audio file"
        }

        var $file_size {
          value = $audio_storage.size
          description = "Size of uploaded audio file in bytes"
        }

        var $filename {
          value = $audio_storage.name
          description = "Original filename"
        }

        conditional {
          if ($allowed_audio_types|contains:$file_mime) {
            throw {
              name = "inputerror"
              value = "Invalid file type. Only audio files (MP3, WAV, M4A, AAC, OGG, FLAC) are allowed."
            }
          }
        }

        conditional {
          if ($file_size > 26214400) {
            throw {
              name = "inputerror"
              value = "File size too large. Maximum size is 25MB."
            }
          }
        }

        var $transcription_params {
          value = {}
          description = "Parameters for transcription request"
        }

        conditional {
          if ($input.language != "") {
            var.update $transcription_params {
              value = $transcription_params|set:"language":$input.language
            }
          }
        }

        api.request {
          url = "https://api.elevenlabs.io/v1/speech-to-text"
          method = "POST"
          params = {}|set:"file":$input.audio|set:"model_id":"scribe_v1"
          headers = []|push:"xi-api-key: " ~ $env.elevenlabs_audio_key
          timeout = 120
          verify_host = false
          verify_peer = false
          description = "Send audio to ElevenLabs for transcription"
        } as $transcription_response

        var $transcript_text {
          value = $transcription_response.response.result.text
          description = "Extracted transcript text"
        }

        var $detected_language {
          value = $transcription_response.response.result.language_code
          description = "Language detected by ElevenLabs"
        }

        var $confidence {
          value = $transcription_response.response.result.language_probability
          description = "Transcription language confidence score"
        }

        db.add audio_file {
          data = {
            created_at   : "now"
            user         : $auth.id
            filename     : $filename
            file_type    : $file_mime
            file_size    : $file_size
            transcription: $transcript_text
            status       : "completed"
            metadata     : $audio_storage
            audio_file   : $audio_storage
          }
        } as $audio_file

        var $result {
          value = {
            event: "audio_transcription_success",
            audio_id: $audio_file.id,
            user_id: $auth.id,
            filename: $filename,
            transcript_length: ($transcript_text|strlen)
          }
        }

        debug.log {
          value = {
            event: "audio_transcription_success",
            audio_id: $audio_file.id,
            user_id: $auth.id,
            filename: $filename,
            transcript_length: ($transcript_text|strlen)
          }

          description = "Log successful transcription"
        }
      }
    }
  }

  response = $result

  history = false
}
```

## upload_image_endpoint

```xs
query "upload/image" verb=POST {
  auth = "user"
  api_group = "media"
  input {
    file? image
    text access_level?=public filters=trim {
      description = "Access level for the image (public or private)"
    }
  }

  stack {
    try_catch {
      try {
        conditional {
          if ($input.access_level == "private") {
            storage.create_image {
              description = "Store image in cloud storage as private"
              value = $input.image
              access = "private"
              filename = $filename
            } as $image_storage
          }

          else {
            storage.create_image {
              description = "Store image in cloud storage as public"
              value = $input.image
              access = "public"
              filename = $filename
            } as $image_storage
          }
        }
      }

      catch {
        throw {
          name = "Invalid image"
          value = $error.message
        }
      }
    }

    !debug.stop {
      value = $image_storage
    }

    try_catch {
      try {
        var $allowed_types {
          description = "List of allowed image MIME types"
          value = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
        }

        var $file_mime {
          description = "MIME type of uploaded file"
          value = $image_storage.mime
        }

        var $file_size {
          description = "Size of uploaded file in bytes"
          value = $image_storage.size
        }

        var $filename {
          description = "Original filename"
          value = $image_storage.name
        }

        conditional {
          if ($allowed_types|contains:$file_mime) {
            throw {
              name = "ValidationError"
              value = "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
            }
          }
        }

        conditional {
          if ($file_size > 10485760) {
            throw {
              name = "ValidationError"
              value = "File size too large. Maximum size is 10MB."
            }
          }
        }

        db.get "user" {
          description = "Verify user exists"
          field_name = "id"
          field_value = $auth.id
        } as $user

        conditional {
          if ($user == "") {
            throw {
              name = "ValidationError"
              value = "Invalid user ID provided."
            }
          }
        }

        db.add images {
          description = "Save image metadata to database"
          data = {
            created_at  : "now"
            user_id     : $auth.id
            filename    : $filename
            file_type   : $file_mime
            file_size   : $file_size
            image_url   : $image_storage.path
            access_level: $input.access_level
            is_active   : true
            image_meta  : $image_storage
          }
        } as $image_record
      }

      catch {
        debug.log {
          description = "Log upload failure"
          value = "Image upload failed:"|concat:$error.message:" "
        }
      }
    }
  }

  response = {
    success  : true
    image_id : $image_record.id
    image_url: $image_storage.path
  }

  history = "inherit"
}
```

## retrieve_active_user_profile

````xs
// API endpoint to retrieve active user profile details based on user_id
query "user_profile/{user_id}" verb=GET {
  api_group = "profiles"

  input {
    // Unique identifier for the user
    int user_id
  }

  stack {
    // Retrieve active user profile details
    db.query user {
      where = $db.user.id == $input.user_id && $db.user.is_active
      return = {type: "single"}
      mock = {
        "should return null for inactive": null
        "should return active profile"   : ```
          {
              "id": 7,
              "user": 42,
              "full_name": "Jane Doe",
              "email": "jane@example.com",
              "is_active": true
          }
          ```
      }
    } as $profile
  }

  response = $profile
  history = 10000

  test "should return null for inactive" {
    input = {user_id: 99}

    expect.to_be_null ($response)
  }

  test "should return active profile" {
    input = {user_id: 42}

    expect.to_equal ($response) {
      value = {
        id       : 7
        user     : 42
        full_name: "Jane Doe"
        email    : "jane@example.com"
        is_active: true
      }
    }
  }
}
````

## blog_posts_by_user

```xs
query "blog_posts_by_user/{user_id}" verb=GET {
  description = "list all post by a given user and the number of comments and likes it received"
  auth = "user"
  input {
    int user_id
  }

  stack {
    db.query blog_post {
      where = $db.blog_post.author_id == $input.user_id
      sort = {blog_post.publication_date: "desc"}
      return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
      addon = [
        {
          name : "blog_post_likes"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_likes"
        }
        {
          name : "blog_post_comments"
          input: {blog_post_id: $output.id}
          as   : "items.blog_post_comments"
        }
      ]
    } as $posts
  }

  response = $posts

  history = "inherit"
}
```

## notification_system_endpoint

```xs
query "send_notification" verb=POST {
  description = "Sends notifications to users via multiple channels (push, email, SMS). It validates input, checks user notification preferences, routes to appropriate external services, tracks delivery status, and logs all notification attempts with their outcomes."
  input {
    int user_id
    text notification_type {
      description = "Type of notification: push, email, sms"
    }

    text title filters=trim {
      description = "Notification title"
    }

    text message filters=trim {
      description = "Notification message content"
    }

    json data {
      description = "Additional notification data"
    }

    bool force? {
      description = "Force send even if user has disabled this notification type"
    }
  }

  stack {
    debug.log {
      description = "Log notification attempt start"
      value = "Starting notification send for user " ~ $input.user_id
    }

    precondition ($input.notification_type == "push" || $input.notification_type == "email" || $input.notification_type == "sms") {
      description = "Validate that notification type is one of the three supported types"
      error_type = "inputerror"
      error = "Invalid notification type. Must be: push, email, or sms"
    }

    precondition (($input.title|strlen) > 0) {
      description = "Ensure the notification title is not empty"
      error_type = "inputerror"
      error = "Notification title is required"
    }

    db.query "notification_preference" {
      description = "Check user notification preferences"
      where = $db.notification_preference.user_id == $input.user_id && $db.notification_preference.notification_type == $input.notification_type
      return = {type: "list"}
    } as $user_preferences

    conditional {
      description = "If no preferences exist, create default preferences with notifications enabled. Otherwise, get the user's enabled status from existing preferences"
      if (($user_preferences|count) == 0) {
        db.add notification_preference {
          description = "Create default notification preference"
          data = {
            user_id          : $input.user_id
            notification_type: $input.notification_type
            enabled          : true
            preferences      : "{}"
          }
        } as $new_preference

        var $user_enabled {
          value = true
        }
      }

      elseif ($input.notification_type == "asdfasdf") {
      }

      else {
        var $user_enabled {
          value = ($user_preferences|first).enabled
        }
      }
    }

    conditional {
      description = "Set up different API calls based on notification type"
      if ($input.notification_type == "push") {
        api.request {
          description = "Sample API call"
          url = "https://mandrillapp.com/api/1.0/messages/send"
          method = "POST"
          params = {}|set:"key":$env.your_api_key|set:"message":({}|set:"from_email":"you@yourdomain.com"|set:"from_name":"Your Name"|set:"subject":"Test Transactional Email"|set:"text":"Hello, this is a transactional email!"|set:"to":([]|push:({}|set:"email":"recipient@example.com"|set:"name":"Recipient Name"|set:"type":"to")))
          headers = []|push:"Content-Type: application/json"
        } as $api_endpoint
      }

      elseif ($input.notification_type == "email") {
        api.request {
          description = "Sample API call"
          url = "https://mandrillapp.com/api/1.0/messages/send"
          method = "POST"
          params = {}|set:"key":$env.your_api_key|set:"message":({}|set:"from_email":"you@yourdomain.com"|set:"from_name":"Your Name"|set:"subject":"Test Transactional Email"|set:"text":"Hello, this is a transactional email!"|set:"to":([]|push:({}|set:"email":"recipient@example.com"|set:"name":"Recipient Name"|set:"type":"to")))
          headers = []|push:"Content-Type: application/json"
        } as $api_endpoint
      }

      elseif ($input.notification_type == "sms") {
        api.request {
          description = "Sample API call"
          url = "https://api.twilio.com/2010-04-01/Accounts/ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/Messages"
          method = "POST"
          params = {}|set:"To":" 1234567890"|set:"From":" 1987654321"|set:"Body":"Hello from Twilio!"
          headers = []|push:("Authorization: Basic %s"|sprintf:("ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX:your_auth_token"|base64_encode))
        } as $api_endpoint
      }
    }

    conditional {
      description = "Skip user if not enabled AND force send is false"
      if ($user_enabled == false && $input.force == false) {
        var $status_result {
          value = "skipped"
        }

        var $external_ref {
          value = ""
        }

        debug.log {
          value = "Skipped user"
        }
      }
    }

    conditional {
      description = "Process the API response and set status"
      if ($api_response.status_code >= 200 && $api_response.status_code < 300) {
        var $status_result {
          value = "sent"
        }

        var $external_ref {
          value = $api_response.body.id
        }
      }

      elseif ($status_result == "skipped") {
        debug.log {
          value = "Status already set above, do nothing"
        }
      }

      else {
        var $status_result {
          value = "failed"
        }

        var $external_ref {
          value = ""
        }
      }
    }

    db.add notification_log {
      description = "Log the notification attempt to the database"
      data = {
        created_at       : "now"
        user_id          : $input.user_id
        notification_type: $input.notification_type
        title            : $input.title
        message          : $input.message
        response_data    : $api_endpoint
      }
    } as $notification_log
  }

  response = null

  history = 1000
}
```

## products_search_endpoint

Searches products with optional filters and pagination. Notice how the `category_id` filter is optional and the search term will be ignored if not provided (thanks to the operator `==?`).

```xs
query "products/search" verb=GET {
  input {
    text search_term? filters=trim {
      description = "Search term to match against product name and description"
    }

    int category_id? filters=min:0 {
      description = "Optional category ID to filter products"
    }

    int page?=1 filters=min:1 {
      description = "Page number for pagination (starts at 1)"
    }

    int per_page?=20 filters=min:1|max:100 {
      description = "Number of items per page (max 100)"
    }
  }

  stack {
    db.query "product" {
      description = "Search products with filters and pagination"
      where = $db.product.category_id ==? $input.category_id && ($db.product.name includes? $input.search_term || $db.product.description includes? $input.search_term)
      sort = {product.price: "asc"}
      return = {type: "list"}
    } as $products
  }

  response = $products

  history = "inherit"
}
```

## signup_endpoint

```xs
query "auth/signup" verb=POST {
  description = "Signup and retrieve an authentication token"
  input {
    text name? {
      description = "User's name (optional)"
    }

    email email? {
      description = "User's email address (required for signup)"
      sensitive = true
    }

    text password? {
      description = "User's password (required for signup)"
      sensitive = true
    }
  }

  stack {
    db.get "user" {
      description = "Check if a user with this email already exists"
      field_name = "email"
      field_value = $input.email
    } as $user

    precondition ($user == null) {
      description = "Prevent duplicate signup with the same email"
      error_type = "accessdenied"
      error = "This account is already in use."
    }

    db.add user {
      description = "Create a new user record with provided details"
      data = {
        created_at: "now"
        name      : $input.name
        email     : $input.email
        password  : $input.password
      }
    } as $user

    security.create_auth_token {
      description = "Generate an authentication token for the new user"
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $authToken
  }

  response = {authToken: $authToken}

  history = 1000
}
```

## search_users_endpoint

```xs
query "users" verb=GET {
  auth = "user"
  input {
    text filter
  }

  stack {
    db.query "user" {
      description = "Search users"
      where = $db.user.name includes $input.filter
      sort = {user.name: "asc"}
      return = {type: "list"}
    } as $users
  }

  response = $users

  history = "inherit"
}
```

```xs
query "webhook_receiver" verb=POST {
  api_group = "webhooks"
  input {
    text webhook_id
    text signature?
  }

  stack {
    util.get_input {
      encoding = "json"
    } as $payload_data

    conditional {
      if ($payload_data.body.event_type == "user.created") {
        db.add webhook_logs {
          data = {
            webhook_id  : $input.webhook_id
            event_type  : "user.created"
            status      : "processed"
            payload     : $payload_data
            signature   : $input.signature
            user_id     : $payload_data.body.user.id
            received_at : now
            processed_at: now
            retry_count : 0
            max_retries : 3
          }
        } as $webhook_record
      }

      elseif ($payload_data.body.event_type == "payment.completed") {
        db.add webhook_logs {
          data = {
            webhook_id  : $input.webhook_id
            event_type  : "payment.completed"
            status      : "processed"
            payload     : $payload_data
            signature   : $input.signature
            payment_id  : $payload_data.payment.id
            amount      : $payload_data.payment.amount
            received_at : now
            processed_at: now
            retry_count : 0
            max_retries : 3
          }
        } as $webhook_record
      }

      else {
        db.add webhook_logs {
          data = {
            webhook_id  : $input.webhook_id
            event_type  : $payload_data.event_type
            status      : "processed"
            payload     : $payload_data
            signature   : $input.signature
            received_at : now
            processed_at: now
            retry_count : 0
            max_retries : 3
          }
        } as $webhook_record
      }
    }
  }

  response = {
    webhook_processed: true
    message          : "Webhook processed successfully"
    webhook_id       : $input.webhook_id
    event_type       : $payload_data.body.event_type
  }

  history = 100
}
```

```
query "list_orders" verb=GET {
  description = "Display all the order in a html table view"
  api_group = "orders"
  input {
    int year?=2025
  }

  stack {
    var $start_of_year {
      description = "Start of the year for filtering"
      value = $input.year ~ "-01-01T00:00:00.000-08:00"
    }

    var $end_of_year {
      description = "End of the year for filtering (exclusive)"
      value = ($input.year + 1) ~ "-01-01T00:00:00.000-08:00"
    }

    db.query orders {
      where = $db.orders.order_date >= $start_of_year && $db.orders.order_date < $end_of_year
      return = {type: "list"}
      addon = [
        {
          name : "customer"
          input: {customer_id: $output.customer_id}
          as   : "_customer"
        }
      ]
    } as $orders

    util.template_engine {
      description = "Initialize HTML output with table structure"
      value = """
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order List</title>
            <!-- Bootstrap CSS CDN -->
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous">
        </head>
        <body>
            <div class="container mt-5">
                <h1 class="mb-4">Customer Orders</h1>

                {% if $var.orders is defined and $var.orders|length > 0 %}
                <table class="table table-striped table-bordered table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th scope="col">Order ID</th>
                            <th scope="col">Customer Address</th>
                            <th scope="col">Product Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {% for order in $var.orders %}
                        <tr>
                            <td>{{ order.id }}</td>
                            <td>{{ order._customer.street_address }}{% if order._customer.city %}, {{ order._customer.city }}{% endif %}{% if order._customer.zip_code %}, {{ order._customer.zip_code }}{% endif %}</td>
                            <td>{{ order.product_name }}</td>
                            <td>${{ order.order_total|number_format(2) }}</td>
                            <td><span class="badge bg-{% if order.status == 'completed' %}success{% elseif order.status == 'pending' %}warning{% else %}danger{% endif %}">{{ order.status|capitalize }}</span></td>

                        </tr>
                        {% endfor %}
                    </tbody>
                </table>
                {% else %}
                <div class="alert alert-info" role="alert">
                    No orders found.
                </div>
                {% endif %}

            </div>

            <!-- Bootstrap JS and Popper.js CDN (optional, for interactive components) -->
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" crossorigin="anonymous"></script>
        </body>
        </html>
        """
    } as $html_output

    util.set_header {
      value = "Content-Type: text/html; charset=utf-8"
      duplicates = "replace"
    }
  }

  response = $html_output

  history = "inherit"
}
```


# Input Parameters

How to define addon parameters with proper types, validation, and foreign key references.

## Core Principles

- **Explicitness**: Always specify data types, optionality, and constraints to prevent runtime errors and enhance readability.
- **Validation**: Use filters and preconditions to enforce data integrity early in the execution flow.
- **Security**: Mark sensitive fields (e.g., passwords, emails) explicitly and apply appropriate filters (e.g., `lower` for emails).
- **Documentation**: Include a `description` for every input field to clarify its purpose and expected format.
- **Conciseness**: Avoid redundant validation; leverage defaults and filters where appropriate.

Inputs are defined within the `input` block of `query` or `function` declarations. The `response` block remains unaffected by inputs, focusing solely on outputs.

```xs
function "foo" {
  input {
    ...
  }

  stack {
    ...
  }

  response = null
}
```

## Input Structure

The `input` block accepts a series of field definitions, each following this syntax:

```
<type> <field_name>[?]? [filters=<filter_list>] {
  description = "<explanation>"
  [sensitive = true/false]
  [table = "<table_name>"]
  [schema { ... }]  // For nested objects
}
```

- **`<type>`**: Specifies the data type (see Types section below).
- **`?` (nullable marker)**: Append one `?` to the type for nullable fields (`int?` can be `null`).
- **`<field_name>`**: A descriptive identifier (e.g., `user_id`).
- **`?` (optional marker)**: Append one `?` to the field name for optional fields (not required).
- **`?=<default>`**: Alternatively from the single `?`, use `?=<value>` to set a default value for optional fields.
- **`filters=`**: Pipe-separated list of transformations or validations (e.g., `filters=trim|lower|min:1`).
- **`description`**: Optional but recommended explanatory text.
- **`sensitive`**: Boolean flag for logging/masking sensitive data from the logs (default: false).
- **`table`**: Links to a database table for foreign key validation (e.g., primary keys).
- **`schema`**: Nested block used by the `object` type to enforce structure.

### Nullable vs Optional

The first `?` on the type indicates the field can be of the given type or `null` (nullable).
The second `?` on the field name indicates it is optional (not required).

Examples:

```xs
input {
    text? required_and_nullable {
      description = "Can be null but must be provided"
    }
    text required_and_not_nullable {
      description = "Must be provided and cannot be null"
    }
    text? not_required_and_nullable? {
      description = "Can be null and is optional"
    }
    text not_required_and_not_nullable? {
      description = "Must be provided but cannot be null"
    }
}
```

### Arrays

Denote arrays with `[]` after the type (e.g., `int[]` for an array of integers). To limit the number of elements, use a range (e.g., `int[1:10]`). Filters apply element-wise.

```xs
input {
    int[1:10] max_10_scores? filters=min:0|max:100 {
      description = "Accepts between 1 and 10 scores between 0 and 100"
    }
    text[] tags? filters=trim|lower|ok:abcdefghijklmnopqrstuvwxyz0123456789, {
      description = "Array of tags, each trimmed and lowercased"
    }
}
```

### Defaults

Assign defaults with `?=<value>` (e.g., `int page?=1`).

```xs
input {
    int page?=1 filters=min:1 {
      description = "Page number, defaults to 1"
    }
    int page_size?=20 filters=min:1|max:100 {
      description = "Page size, defaults to 20, max 100"
    }
}
```

## Supported Types

The following types are accepted. Select based on the expected data format to enable automatic parsing and validation:

| Type             | Description                                                            | Example Usage                                     |
| ---------------- | ---------------------------------------------------------------------- | ------------------------------------------------- |
| `int`            | Signed 32-bit integer.                                                 | `int user_id`                                     |
| `decimal`        | Floating-point number with arbitrary precision.                        | `decimal price filters=min:0`                     |
| `text`           | Arbitrary string (UTF-8).                                              | `text title filters=trim`                         |
| `email`          | Validated email address.                                               | `email contact_email sensitive=true`              |
| `password`       | Secure string for credentials (hashed internally).                     | `password api_key filters=min:12`                 |
| `bool`           | Boolean (true/false).                                                  | `bool is_active?=true`                            |
| `timestamp`      | Epoch milliseconds (UTC) or ISO string.                                | `timestamp created_at`                            |
| `date`           | ISO date string (YYYY-MM-DD).                                          | `date birth_date`                                 |
| `uuid`           | Universally unique identifier (validated format).                      | `uuid session_id?`                                |
| `json`           | Parsed JSON object or array.                                           | `json metadata`                                   |
| `vector`         | Fixed-size numeric array for embeddings (specify dimension if needed). | `vector embedding`                                |
| `dblink`         | Database-linked object (auto-populates from table).                    | `dblink { table = "orders" }`                     |
| `enum`           | Restricted to predefined values.                                       | `enum status { values = ["active", "inactive"] }` |
| `file`           | File resource (accepts URL or data URI).                               | `file avatar`                                     |
| `image`          | Image file (subset of `file` with validation).                         | `image profile_photo`                             |
| `video`          | Video file.                                                            | `video tutorial`                                  |
| `audio`          | Audio file.                                                            | `audio recording`                                 |
| `attachment`     | Generic file attachment.                                               | `attachment document`                             |
| `geo_point`      | Geographic point (lat, lng).                                           | `geo_point location`                              |
| `geo_multipoint` | Array of geographic points.                                            | `geo_multipoint points`                           |
| `geo_linestring` | Line string of coordinates.                                            | `geo_linestring path`                             |
| `geo_polygon`    | Closed polygon of coordinates.                                         | `geo_polygon boundary`                            |

For arrays: Append `[]` (e.g., `decimal[] scores`).

For nested objects: Use `object` with a `schema` sub-block. For example we could define a `person` object like this:

```xs
input {
  object person? {
    schema {
      enum gender?=undisclosed {
        description = "Gender identity, defaults to undisclosed"
        values = ["undisclosed", "male", "female"]
      }

      text name filters=trim {
        description = "Full name (required)"
      }
      int age? {
        description = "Age in years (optional)"
      }
    }
  }
}
```

## Filters and Transformations

Filters process inputs declaratively. Chain them with `|` (e.g., `filters=trim|lower|min:1|max:100`). Common filters include:

| Filter                | Purpose                                      | Example                                |
| --------------------- | -------------------------------------------- | -------------------------------------- |
| `trim`                | Remove leading/trailing whitespace.          | `text name filters=trim`               |
| `lower`               | Convert to lowercase.                        | `email addr filters=lower`             |
| `upper`               | Convert to uppercase.                        | `text code filters=upper`              |
| `min:<value>`         | Enforce minimum value (numeric or length).   | `int age filters=min:18`               |
| `max:<value>`         | Enforce maximum value.                       | `text desc filters=max:500`            |
| `startsWith:<prefix>` | Require string prefix.                       | `text code filters=startsWith:ABC`     |
| `ok:<pattern>`        | Allow only matching characters (regex-like). | `text hex filters=ok:abcdef0123456789` |
| `prevent:<substring>` | Block specific substrings.                   | `text msg filters=prevent:spam`        |
| `digitOk`             | Permit only digits (for arrays/strings).     | `text[] nums filters=digitOk`          |
| `alphaOk`             | Permit only alphabetic characters.           | `text name filters=alphaOk`            |

- **Array-Specific**: Filters like `count:min:5|max:20` apply to array length.
- **Chaining Order**: Filters execute left-to-right; transformations (e.g., `trim`) precede validations (e.g., `min`).
- **Custom Validation**: For complex rules, use `precondition` in the `stack` block post-input.

## Validation and Error Handling

- **Built-in**: Filters trigger `inputerror` exceptions on failure (this is the preferred method).
- **Preconditions**: In the `stack` (when validating complex rules), for example if we wanted to ensure that a provided start date is before an end date we could do:

```xs
precondition ($input.start_date < $input.end_date) {
  description = "Start date must be before end date"
  error_type = "inputerror"
  error = "Start date must be before end date"
}
```

- **Error Types**: Use `inputerror` for validation, `accessdenied` for auth-related issues.
- **Sensitive Handling**: Set `sensitive=true` on input fields to mask in logs/responses.

## Best Practices

1. **Optionality**: Default to required fields; use `?` sparingly to avoid null-handling complexity.
2. **Arrays and Loops**: For array inputs, pair with `for` or `foreach` in `stack` for iteration.
3. **Database Integration**: Use `table` for foreign keys to auto-validate against schemas.
4. **Testing**: Include `test` blocks in functions/queries to verify input scenarios:

```xs
test "valid input" {
  input = {
    field: "value"
  }
  expect.to_equal ($response) {
    value = "expected"
  }
}
```

5. **Performance**: Limit array sizes with `max` filters; avoid large vectors without pagination.
6. **Security**: Always filter user inputs; never trust raw data.
7. **Nesting**: Limit schema depth to 2-3 levels to prevent over-complexity.

## Common Pitfalls

- **Missing Descriptions**: Omitting `description` reduces code clarity—always include.
- **Filter Misordering**: Validate after transformation (e.g., `trim` before `strlen`).
- **Type Mismatches**: Enforce types strictly; use `decimal` over `int` for precision.
- **Null Propagation**: Optional fields can cascade nulls—handle in `conditional` blocks.
- **No Comments**: Use `description` exclusively; the input section does not support inline comments.

By following these guidelines, inputs will be robust, self-documenting, and aligned with XanoScript's declarative paradigm. For advanced usage, refer to the full syntax reference. If discrepancies arise, prioritize schema consistency across related files.


## What is an Addon?

An addon is a specialized function that runs a single `db.query` statement to fetch related data for each record returned by a main query. Addons are ideal for:

- Fetching counts (likes, comments, views)
- Loading related records (author info, tags, categories)
- Computing aggregations on related data

## Addon Structure

An addon file must be placed in the `addons/` folder and follows this structure:

```xs
addon "<name>" {
  input {
    // Parameters - typically foreign key references
  }

  stack {
    // ONLY a single db.query statement is allowed
    db.query "<table>" {
      where = <condition using $input>
      return = {type: "count"|"list"|"single"}
    }
  }
}
```

## CRITICAL RULE

**Only a single `db.query` statement is allowed in an addon stack.** No other operations (variables, conditionals, loops, etc.) are permitted.

## Using Addons in Queries

Reference addons in a `db.query` using the `addon` array:

```xs
db.query "blog_post" {
  where = $db.blog_post.author_id == $auth.id
  sort = {blog_post.created_at: "desc"}
  return = {type: "list", paging: {page: 1, per_page: 25, totals: true}}
  addon = [
    {
      name : "blog_post_like_count"
      input: {blog_post_id: $output.id}
      as   : "items.like_count"
    }
    {
      name : "blog_post_comments"
      input: {blog_post_id: $output.id}
      as   : "items.comments"
    }
  ]
} as $posts
```

### Addon Reference Properties

| Property | Description                                                        |
| -------- | ------------------------------------------------------------------ |
| `name`   | Name of the addon to call                                          |
| `input`  | Parameters to pass (typically `$output.<field>` from parent query) |
| `as`     | Where to attach the result (use `items.<field>` for list results)  |

## Common Patterns

### Count Addon

Returns the count of related records:

```xs
addon "blog_post_like_count" {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query "blog_post_like" {
      where = $db.blog_post_like.blog_post_id == $input.blog_post_id
      return = {type: "count"}
    }
  }
}
```

### List Addon

Returns a list of related records:

```xs
addon "blog_post_comments" {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query "blog_post_comment" {
      where = $db.blog_post_comment.blog_post_id == $input.blog_post_id
      sort = {blog_post_comment.created_at: "desc"}
      return = {type: "list"}
    }
  }
}
```

### Single Record Addon

Returns a single related record (e.g., author info):

```xs
addon "post_author" {
  input {
    int user_id? {
      table = "user"
    }
  }

  stack {
    db.query "user" {
      where = $db.user.id == $input.user_id
      output = ["id", "name", "avatar"]
      return = {type: "single"}
    }
  }
}
```

### Filtered Count Addon

Returns a count with additional filtering:

```xs
addon "published_comment_count" {
  input {
    uuid blog_post_id? {
      table = "blog_post"
    }
  }

  stack {
    db.query "blog_post_comment" {
      where = $db.blog_post_comment.blog_post_id == $input.blog_post_id && $db.blog_post_comment.status == "published"
      return = {type: "count"}
    }
  }
}
```

## Best Practices

1. **Use descriptive names** - Name addons after what they return (e.g., `post_like_count`, `user_followers`)
2. **Keep it simple** - Only one `db.query` per addon
3. **Use foreign key references** - Mark input fields with `table = "<table>"` for clarity
4. **Make inputs optional** - Use `?` since the parent record may have null references
5. **Limit output fields** - Use `output = [...]` to return only needed fields
6. **Consider performance** - Addons run per record; use counts over full lists when possible
7. **Check for errors** - Use #tool:get_errors to verify your code has no syntax or validation errors after making changes

## Addons vs Joins

| Use Addon When...                 | Use Join When...                  |
| --------------------------------- | --------------------------------- |
| Fetching counts or aggregations   | Filtering by related table fields |
| Loading nested/related objects    | Need data in WHERE clause         |
| Want data attached to each result | Single flat result set is fine    |
| Related data is optional          | Related data is required          |
