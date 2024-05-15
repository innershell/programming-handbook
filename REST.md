# Introduction
A REST API is modeled as collections of individually-addressable resources (the nouns of the API). The resource names naturally map to URLs, and methods naturally map to HTTP methods `POST`, `GET`, `PUT`, `PATCH`, and `DELETE`.

REST is preferred over RPC because there are much fewer things to learn, since developers can focus on the resources and their relationship, and assume that they have the same small number of standard methods. On the other hand, RPC APIs are often designed in terms of interfaces and methods. As more and more of these are added over time, the end result can be an overwhelming and confusing API surface due to the fact that developers must learn each method individually. Obviously this is both time consuming and error-prone.

# API Specifications
Internet Engineering Task Force (IETF) - [RFC 7807](https://datatracker.ietf.org/doc/html/rfc7807)

# Naming Convention
A resource-oriented API is generally modeled as a resource hierarchy, where each node is either a simple resource or a collection resource. For example, Gmail API has a collection of users, each user has a collection of messages, a collection of threads, a collection of labels, a profile resource, and several setting resources.

* Resources are nouns
* Nouns are plural

## Examples
```
GET /users
POST /users/1/documents
```

# Routes & Roles
It is very common to build an application where users have different roles, meaning their access to data varies by their role. REST APIs should be designed around resources, not roles. Instead of having different routes, the API itself should handle the different roles witin the API code itself.

* A user's role should be contained within the authentication token.
* Automatically determine the user's role inside the API and branch the code accordingly.

Errors
```
HTTP/2 409 CONFLICT
{
    "type": "about:blank",
    "title": "Duplicate",
    "status": 409,
    "detail": "Cannot create a user that already exists in your organization.",
    "instance": ""
}
```
