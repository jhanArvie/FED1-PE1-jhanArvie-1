![image](https://github.com/user-attachments/assets/953a0bf8-f7e0-4c58-9e78-a553b0317e8d)


Git repo    https://github.com/NoroffFEU/FED1-PE1-jhanArvie.git

Figma       https://www.figma.com/design/udV9skXSCpGCU8uE6dmsHO/Project-Exam-Blog-Post?node-id=66-107&t=FkNP52OeoxNEONyr-1


Live view   https://poemtales.netlify.app/
# Front-End Blogging Application Project Brief


## Project Requirements
Build a responsive web application for a blogging platform that interfaces with an existing API.

### Terminology
- **User**: A visitor not logged in
- **Owner**: The logged-in blog manager (using your test account)

## Required Pages & User Stories

### Blog Feed Page (`/index.html`)
**Endpoint**: `GET /blog/posts/<name>`

**User Stories**:
- Interactive carousel showing 3 latest posts with navigation
- Responsive thumbnail grid of 12 latest posts
- Clickable elements that lead to specific blog posts

### Specific Blog Post Page (`/post/index.html`)
**Endpoint**: `GET /blog/posts/<name>/<id>`

**User Stories**:
- Display post title, author, date, banner image, and content
- Include shareable URL with post ID
- Responsive layout

### Create Blog Post Page (`/post/create.html`)
**Endpoint**: `POST /blog/posts/<name>`

**User Stories**:
- Authenticated access only
- Form for title, body, and media inputs
- New posts visible in feed

### Blog Post Edit Page (`/post/edit.html`)
**Endpoints**: 
- `PUT /blog/posts/<name>/<id>`
- `DELETE /blog/posts/<name>/<id>`

**User Stories**:
- Owner-only access
- Delete button functionality
- Validated edit form for updates

### Account Pages
- **Login Page** (`/account/login.html`): `POST /auth/login`
- **Register Page** (`/account/register.html`): `POST /auth/register`

## Process Requirements
1. Set up GitHub repository with frequent commits
2. Create Kanban plan with Roadmap view
3. Develop Figma assets including:
   - Style guide (logo, fonts, colors, components)
   - High-fidelity prototypes (desktop & mobile)
4. Implement based on design
5. Manual test all user stories
6. Deploy to static host (Netlify)
7. Validate with testing tools (HTML, SEO, WCAG)

## Deliverables
- GitHub repository link
- Deployed application link
- Figma design documents link
- Project planning board link
- Test admin credentials (email/password)



## Disclaimer
All submissions must comply with ethical standards and institutional policies. Prohibited content includes hate speech, illegal activities, or harmful material. Violations may result in disciplinary action.

API

https://v2.api.noroff.dev/docs/static/index.html#/


