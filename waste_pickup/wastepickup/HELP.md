# Getting Started

## Create Households and Collection Schedules

At `http://localhost:8080`, use **Households > Add Household** to register a name and address under a collection zone. Use **Collection Operations > Add Schedule** to save a collection day and start/end times for a zone. Successful requests are saved through the JPA repositories to the MySQL database configured in `src/main/resources/application.properties`.

The same operations are available from Postman. Set `Content-Type: application/json` for POST requests and replace `1` below with a real zone ID from `GET /api/zones`.

| Operation | Method and URL | JSON body |
| --- | --- | --- |
| List zones | `GET http://localhost:8080/api/zones` | None |
| Create zone | `POST http://localhost:8080/api/zones` | `{"name":"North Zone"}` |
| Create household in zone 1 | `POST http://localhost:8080/api/households/zone/1` | `{"name":"Smith Family","address":"12 Main Street"}` |
| List all households with zone details | `GET http://localhost:8080/api/households` | None |
| List households in zone 1 | `GET http://localhost:8080/api/households/zone/1` | None |
| Create Monday schedule in zone 1 | `POST http://localhost:8080/api/schedules/zone/1` | `{"collectionDay":"MONDAY","startTime":"08:00","endTime":"12:00"}` |
| List schedules in zone 1 | `GET http://localhost:8080/api/schedules/zone/1` | None |
| List all pickup logs with household and zone details | `GET http://localhost:8080/api/pickups` | None |
| Record a pickup for household 1 | `POST http://localhost:8080/api/pickups/household/1` | `{"segregationScore":85}` |

Schedule days use uppercase names from `MONDAY` through `SUNDAY`. Start time must be earlier than end time. Successful create requests return HTTP `201 Created`; invalid values or unknown zone IDs return an error and are not saved.

Pickup logs are saved with the current server timestamp when omitted. A pickup can only be recorded while the household's zone is inside a configured schedule window, and the score must be from 0 through 100. If the pickup API returns `Pickup cannot be recorded outside the scheduled pickup window`, add or adjust that zone's schedule and retry during its active window.

### Reference Documentation
For further reference, please consider the following sections:

* [Official Apache Maven documentation](https://maven.apache.org/guides/index.html)
* [Spring Boot Maven Plugin Reference Guide](https://docs.spring.io/spring-boot/4.1.1/maven-plugin)
* [Create an OCI image](https://docs.spring.io/spring-boot/4.1.1/maven-plugin/build-image.html)
* [Spring Web](https://docs.spring.io/spring-boot/4.1.1/reference/web/servlet.html)

### Guides
The following guides illustrate how to use some features concretely:

* [Building a RESTful Web Service](https://spring.io/guides/gs/rest-service/)
* [Serving Web Content with Spring MVC](https://spring.io/guides/gs/serving-web-content/)
* [Building REST services with Spring](https://spring.io/guides/tutorials/rest/)

### Maven Parent overrides

Due to Maven's design, elements are inherited from the parent POM to the project POM.
While most of the inheritance is fine, it also inherits unwanted elements like `<license>` and `<developers>` from the parent.
To prevent this, the project POM contains empty overrides for these elements.
If you manually switch to a different parent and actually want the inheritance, you need to remove those overrides.

