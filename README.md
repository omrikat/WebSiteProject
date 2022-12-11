<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
  * [Screenshots](#camera-screenshots)
  * [Features](#dart-features)
  * [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
  * [Infrastructure](#bangbang-infrastructure)
  * [Deployment](#triangular_flag_on_post-deployment)
- [Roadmap](#compass-roadmap)
- [Contributing](#wave-contributing)
  * [Code of Conduct](#scroll-code-of-conduct)
- [FAQ](#grey_question-faq)
- [Contact](#handshake-contact)

  

<!-- About the Project -->
##About the Project
```
The project is related to security once development pushes code to GitHub, 
the pipeline will check if there’s a vulnerability and give a score if it's high seems good, 
otherwise will damage the code.
In other words I want to keep the code clean and hard to hack.
And once it's pass the **Quality Gate Status Check**,
there's anothe step **Dockerize The Application** and push it to DockerHub as image.
The last step is run the image into **K8S Cluster**.
```

<!-- Screenshots -->
### :camera: Screenshots
![image]()

<details>
<summary>DevOps</summary>
  <ul>
    <li><a href="https://www.docker.com/">Docker</a></li>
    <li><a href="https://www.jenkins.io/">Jenkins</a></li>
    <li><a href="https://circleci.com/">CircleCLI</a></li>
  </ul>
</details>

<!-- Features -->
### :dart: Features

- Used **Ansible Playbook**
- Used **Docker**
- Used **Kubernetes**

<!-- Env Variables -->
### :key: Environment Variables

To run this project, you will need to add the following environment variables to your environment.

`Terraform`
`AWS`
`Access Key`

<!-- Getting Started -->
##     :toolbox: Getting Started
#### 🐾 What I Use

### :bangbang: Infrastructure

Terraform describe our complete infrastructure in the form of code.

🎨 **Resources:**

`aws_instance`
`aws_vpc`
`aws_security_group`
`aws_internet_gateway`
`aws_subnet`
`aws_route_table`
`Access Key`
`aws_route_table_association`
`aws_lb`
`tls_private_key`
`local_file`
`aws_key_pair`
`EFS - Volume`

**All you need to create these infrastructure:**
```
terraform init
terraform plan
terraform apply
```

### 🔱 **This project uses JSP Page:**

```
Is a text document that contains two types of text: static data, which can be expressed in any text-based format (such as HTML, SVG, WML, and XML), and JSP elements, which construct dynamic content.
Created a simple page that contain some information about DevOps tools.
This ****WebApp** run inside image that I've **Dockerize** it and push it to **DockerHub**.
After that I pull it inside the K8S in this case I used Minikube.
```

```
Start your browser if it is not already running. In the address area of the browser,
type http://localhost:8080/DateJSP.jsp and submit that address to the browser.
```

<!-- Installation -->
### :gear: Configuration

☘️ **Prepared a script that install all the plugins that needs **Instance Jenkins Server**
You can find inside:**
```
git clone https://github.com/shadibdair/securcodes/blob/main/poc/jenkins-script.sh
```

🌿 **Prepared a script that install all the plugins that needs **Instance SonarQube Server**
You can find inside:**
```
git clone https://github.com/shadibdair/securcodes/blob/main/poc/sonarqube-script.sh
```

⭐️ **NOTE**

```
I've stored all the configuration inside EFS AWS ... That saved your time in the next terraform apply.
all the configuration will be saved.
- One for jenkins server EC2
- One for sonarqube server EC2
```

<!-- Deployment -->
### :triangular_flag_on_post: Deployment

```
🍄 This project start deploy once you add new feature inside the code of web-app.
The trigger will notify the job in jenkins, and start scanning the entire project to find vulnerabilities.
Inside the sonarqube I've configure some condition how to scan the code.
```

![image](https://user-images.githubusercontent.com/43513994/205518648-12c75d1d-bb18-4cfd-87b5-9ea0f29aee65.png)

```
If Quality Gate Status Check returned OK ... 
Continue to the next stage/step in according to jenkinsfile pipeline.
```

```
🐻‍❄️ The next stage/step dockerize the application and push it to dockerhub.
```

![image](https://user-images.githubusercontent.com/43513994/205518829-71f9c800-113e-43a6-a98e-8cb39da70435.png)

```
🐣 The last stage/step I've deploy the application into cluster k8s using minikube as cluster.
In this case I used Ansible Playbook, 
that access to ec2 cluster and create a deployment and nodeport service for external access.
After that pullin the image from dockerhub and added to deployment yaml 
that I've created to use it inside the K8S in this case I used Minikube.
```

<!-- Roadmap -->
## :compass: Roadmap

🦅 **The Pipeline Workflow**

![image](https://user-images.githubusercontent.com/43513994/205519448-a0337446-6b19-4ca7-b2a5-b508c818840b.png)


<!-- Contributing -->
## :wave: Contributing

<a href="https://github.com/shadibdair">
  <img src="https://contrib.rocks/image?repo=Louis3797/awesome-readme-template" />
</a>


🗣 Shadi Badir: Contributions are always welcome!


<!-- Code of Conduct -->
### :scroll: Code of Conduct

```
A well-written code of conduct clarifies an organization's mission, values and principles,
linking them with standards of professional conduct.
The code articulates the values the organization wishes to foster in leaders and employees and,
in doing so, defines desired behavior.
```

<!-- FAQ -->
## :grey_question: FAQ

- 🧛 Question 1 : How many ec2's were used ?

  + Answer 1 : 
  + I've used 3 instances
  ```
  1- EC2 For Jenkins Server
     - I've prepared a script that install, configure and stored the plugins from EFS volume.
  2- EC2 For SonarQube Server
     - I've prepared a script that install, configure and stored the plugins from EFS volume.
  3- EC2 For Cluster K8S - Minikube
     - Installed manualy the minikube cluster
  ```

- 🧑🏼‍💻 Question 2 : What is your next step / features ?

  + Answer 2
  ```
  Will creating new stages/steps that scan the code more deply :
  Static application security testing (SAST) and 
  dynamic application security testing (DAST) 
  are both methods of testing for security vulnerabilities,
  ```
  
- 🐉 Question 3 : What you've learned from this project ?

  + Answer 3
  ```
  The most important thing, I faced new errors and solved it.
  Stack-overflow was my best friend 💚.
  And I've learned ansible playbook and how to use it with jenkins.
  I tried to use many tools as: 
  Jenkinsfile, Dockerfile, Docker-Compose, Ansible, K8S, AWS Services, Terraform.
  ```

- ⛄️ Question 4 : What's your advice ?

  + Answer 4
  ```
  Don’t trust user input: 😈
  A significant amount of vulnerabilities in web applications including
  cross site scripting, SQL injections and buffer overflows can be attributed to
  the fact that the software trusted user input. Every field on an input
  form should have at least one check to validate that the data is in the correct
  format. For example, an address should be checked to make sure 
  it doesn’t include a colon or backslash. 
  
  ```

<!-- Contact -->
## :handshake: Contact

👤 Your Name - [@linkedin](https://www.linkedin.com/in/shadi-badir/) - Shadi Badir

🥷🏻 Project Link: 

**Web Application - where I build the jenkinsfile pipeline, dockerfil, ansible.**
- [https://github.com/shadibdair/web-app-sq](https://github.com/shadibdair/web-app-sq)

**Infrastructure as code - where I build the aws services.**
- [https://github.com/shadibdair/securcodes](https://github.com/shadibdair/securcodes)
