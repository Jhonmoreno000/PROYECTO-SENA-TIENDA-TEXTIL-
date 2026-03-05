# Jhon Moreno

Software Developer | SENA Student - Software Analysis and Development

Building robust backend systems with clean architecture and scalable database design.

## About Me

I'm a software development student at SENA Colombia, passionate about creating efficient backend solutions and well-structured databases. Currently focusing on enterprise-level architecture patterns and industry best practices.

**Current Status:** Actively developing projects that demonstrate real-world application of software engineering principles.

## Technical Skills

### Programming Languages
<div align="center">

![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?style=for-the-badge&logo=php&logoColor=white)

</div>

### Databases & Tools
<div align="center">

![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)
![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

</div>

### Methodologies & Concepts
<div align="center">

![Agile](https://img.shields.io/badge/Agile-009FDA?style=for-the-badge&logo=agile&logoColor=white)
![Scrum](https://img.shields.io/badge/Scrum-6DB33F?style=for-the-badge&logo=scrumalliance&logoColor=white)
![REST API](https://img.shields.io/badge/REST_API-02569B?style=for-the-badge&logo=rest&logoColor=white)
![MVC](https://img.shields.io/badge/MVC-5C2D91?style=for-the-badge&logo=dotnet&logoColor=white)

</div>

### Core Competencies

**Backend Development**
- RESTful API design and implementation
- Business logic layer development
- Error handling and validation
- Authentication and authorization

**Database Management**
- Relational database design
- Data normalization (1NF, 2NF, 3NF)
- Query optimization and indexing
- Transaction management

**Software Architecture**
- Layered architecture pattern
- SOLID principles
- Separation of concerns
- Dependency injection

## Featured Projects

### Academic Portfolio

**Enterprise Backend Systems**
- Implemented layered architecture with clear separation of concerns
- Developed CRUD operations with proper validation
- Applied object-oriented programming principles

**Database Design Projects**
- Normalized database schemas for business scenarios
- Created complex SQL queries with joins and subqueries
- Implemented stored procedures and triggers

**API Development**
- Built RESTful endpoints with proper HTTP methods
- Implemented request/response handling
- Added input validation and error responses

## Architecture Approach

### System Design Philosophy

I follow a structured approach to building software systems:

```mermaid
graph LR
    A[Requirements] --> B[Design]
    B --> C[Implementation]
    C --> D[Testing]
    D --> E[Deployment]
    E --> F[Maintenance]
```

### Application Architecture

```mermaid
graph TD
    Client[<b>Client Application</b>] --> API[<b>API Gateway</b>]
    API --> Auth[<b>Authentication</b>]
    Auth --> Controller[<b>Controller Layer</b>]
    Controller --> Service[<b>Service Layer</b>]
    Service --> Repository[<b>Repository Layer</b>]
    Repository --> DB[(<b>Database</b>)]

    %% Estilos con texto forzado en negro para que se lea bien
    style Client fill:#B3E5FC,stroke:#01579B,stroke-width:2px,color:#000
    style API fill:#FFE0B2,stroke:#E65100,stroke-width:2px,color:#000
    style Auth fill:#333333,stroke:#000,stroke-width:2px,color:#fff
    style Controller fill:#F8BBD0,stroke:#880E4F,stroke-width:2px,color:#000
    style Service fill:#C8E6C9,stroke:#1B5E20,stroke-width:2px,color:#000
    style Repository fill:#E1BEE7,stroke:#4A148C,stroke-width:2px,color:#000
    style DB fill:#FFCDD2,stroke:#B71C1C,stroke-width:2px,color:#000
```

### Layer Responsibilities

**Presentation Layer (Controller)**
- Receives HTTP requests
- Validates input data
- Returns formatted responses
- Handles routing

**Business Logic Layer (Service)**
- Implements business rules
- Coordinates operations
- Manages transactions
- Applies validations

**Data Access Layer (Repository)**
- Executes database queries
- Manages connections
- Handles data mapping
- Optimizes performance

**Database Layer**
- Stores persistent data
- Enforces constraints
- Maintains relationships
- Ensures data integrity

## Database Design Principles

### Normalization Process

**First Normal Form (1NF):** Atomic values, no repeating groups

**Second Normal Form (2NF):** No partial dependencies

**Third Normal Form (3NF):** No transitive dependencies

### Example Schema

```mermaid
erDiagram
    USERS ||--o{ ORDERS : places
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : includes
    
    USERS {
        int user_id PK
        string email UK
        string name
        datetime created_at
    }
    
    ORDERS {
        int order_id PK
        int user_id FK
        decimal total
        datetime order_date
    }
    
    PRODUCTS {
        int product_id PK
        string name
        decimal price
        int stock
    }
    
    ORDER_ITEMS {
        int item_id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal subtotal
    }
```

## Development Workflow

```mermaid
graph LR
    A[Plan] --> B[Code]
    B --> C[Test]
    C --> D[Commit]
    D --> E[Push]
    E --> F[Review]
    F --> G{Approved?}
    G -->|Yes| H[Merge]
    G -->|No| B
```

## GitHub Statistics

<div align="center">
  
  # Hola, soy Jhon Anderson Moreno
  
  [![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&pause=1000&color=7AA2F7&center=true&vCenter=true&width=435&lines=Estudiante+de+Ciberseguridad;Entusiasta+de+Kali+Linux;Aprendiendo+Criptograf%C3%ADa)](https://git.io/typing-svg)

  ---

  ### Mis Estadísticas de GitHub
  
  <img src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=Jhonmoreno000&theme=tokyonight" alt="Detalles de Perfil" />
  
  <br />

  <img src="https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=Jhonmoreno000&theme=tokyonight" alt="Lenguajes con más Commits" />
  <img src="https://github-profile-summary-cards.vercel.app/api/cards/stats?username=Jhonmoreno000&theme=tokyonight" alt="Estadísticas Generales" />

  ---

  ### Herramientas y Tecnologías
  
  ![Kali Linux](https://img.shields.io/badge/Kali_Linux-557C94?style=for-the-badge&logo=kali-linux&logoColor=white)
  ![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
  ![Bash](https://img.shields.io/badge/Bash-4EAA25?style=for-the-badge&logo=gnu-bash&logoColor=white)
  ![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

</div>

## Contribution Snake

![Snake animation](https://raw.githubusercontent.com/Jhonmoreno000/Jhonmoreno000/output/github-snake.svg)

## Learning Journey

**Currently Studying:**
- Advanced database optimization techniques
- Design patterns (Singleton, Factory, Strategy)
- Microservices architecture fundamentals
- Unit testing and TDD principles

**Next Goals:**
- Learn Docker containerization
- Explore cloud platforms (AWS/Azure)
- Study message queues (RabbitMQ)
- Master CI/CD pipelines

## SENA Formation

**Program:** Tecnólogo en Análisis y Desarrollo de Software

**Key Learnings:**
- Software development lifecycle
- Agile methodologies (Scrum)
- UML diagramming
- Requirements analysis
- Quality assurance fundamentals

## Code Philosophy

**Clean Code Principles:**
- Meaningful variable and function names
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Proper commenting and documentation
- Consistent code formatting

**Best Practices:**
- Version control with Git
- Code reviews before merging
- Writing reusable components
- Error handling and logging
- Security-first mindset

## Activity & Contributions

**Development Focus:**
- Building portfolio projects showcasing architectural patterns
- Contributing to open-source when possible
- Practicing code refactoring
- Documenting technical decisions

**Collaboration:**
- Open to pair programming sessions
- Willing to review code and provide feedback
- Available for student collaboration projects
- Interested in tech community participation

## Contact & Connect

**Email:** morenopossojhonanderson313@gmail.com

**GitHub:** [@Jhonmoreno000](https://github.com/Jhonmoreno000)

**Location:** Medellín, Colombia

---

### Let's Connect

I'm actively looking for opportunities to collaborate on backend projects, contribute to open-source, and connect with other developers. Feel free to reach out for project collaboration, code reviews, or technical discussions.

**Status:** Available for internships and junior developer positions

---

<details>
<summary> Coding Stats</summary>

<br>

<!--START_SECTION:waka-->
<!--END_SECTION:waka-->

**Weekly Development Breakdown**

```text
Java         8 hrs 15 mins   ████████████░░░░░░░░░   45.2%
Python       4 hrs 30 mins   ██████░░░░░░░░░░░░░░░   24.8%
SQL          3 hrs 20 mins   ████░░░░░░░░░░░░░░░░░   18.3%
JavaScript   1 hr 45 mins    ██░░░░░░░░░░░░░░░░░░░    9.6%
Other        25 mins         ░░░░░░░░░░░░░░░░░░░░░    2.1%
```

</details>

<details>
<summary> Current Projects</summary>

<br>

###  In Progress

- **E-commerce Backend API** - RESTful API with JWT authentication
- **Task Management System** - CRUD application with MySQL
- **Database Optimization Study** - Index analysis and query tuning

###  Study Projects

- Implementing design patterns in Java
- Building microservices architecture examples
- Creating technical documentation templates

</details>

<details>
<summary> Fun Facts About Me</summary>

<br>

```javascript
const jhon = {
    location: "Medellín, Colombia",
    education: "SENA - Software Development",
    currentlyLearning: ["Docker", "AWS", "Spring Boot"],
    hobbies: ["Coding", "Tech blogs", "Problem solving"],
    funFact: "I debug with console.log() and I'm not ashamed",
    coffee: " (Required for coding)",
    timezone: "GMT-5"
};
```

</details>

---

<div align="center">

###  Let's Build Something Amazing Together

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:morenopossojhonanderson313@gmail.com)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Jhonmoreno000)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourprofile)

![Profile Views](https://komarev.com/ghpvc/?username=Jhonmoreno000&color=blueviolet&style=for-the-badge)



</div>
