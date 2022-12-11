<!-- Table of Contents -->
# :notebook_with_decorative_cover: Table of Contents

- [About the Project](#star2-about-the-project)
  * [Screenshots](#camera-screenshots)
  * [Features](#dart-features)
  * [Environment Variables](#key-environment-variables)
- [Getting Started](#toolbox-getting-started)
  * [Infrastructure](#bangbang-infrastructure)
  * [Deployment](#triangular_flag_on_post-deployment)
- [Contact](#handshake-contact)

  

<!-- About the Project -->
##About the Project
```
The project is related to making our website safe and stable,the website uploaded to three machines that connected to share files service in AWS .
If one of the machine update any file, will updated all machine.
Also we test the website if it works well in lambda function , it check text that should be in the website.
```

<details>
<summary>DevOps</summary>
  <ul>
    <li><a href="https://www.docker.com/">Docker</a></li>
    <li><a href="https://www.jenkins.io/">Jenkins</a></li>
    <li><a href="https://circleci.com/">CircleCLI</a></li>
  </ul>
</details>


**How to Deploy CloudFormation Template using AWS CLI:**
```
aws cloudformation deploy --template-file deployment.yaml --stack-name "my-new-stack"
```



<!-- Features -->
###Features

- Used **AWS**
- Used **HTML**
- Used **TypeScript**

<!-- Env Variables -->
###Environment Variables

To run this project, you will should to add the following environment variables to your environment.

`AWS`
`Chrome`
`Access Key`

<!-- Getting Started -->
## Getting Started

##Infrastructure
### 1.Install and Run with Docker (recommended)
Docker with docker-compose is the official and recommend way of installing and running Pigallery2. It contains all necessary dependencies, auto restarts on reboot, supports https, easy to upgrade to newer versions. For configuration and docker-compose files read more here or check all builds: https://hub.docker.com/r/bpatrik/pigallery2/tags/
###2.Direct Install 
if you are familiar with Node.js and building npm packages from source)
As an alternative, you can also directly install Node.js and the app and run it natively.

###2.1.1 Install Node.js
####Download and extract
```
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt-get install -y nodejs

```
###2.2.2 Install PiGallery2
Note: A build requires a machine with around 2GB or memory.
```
cd ~
wget https://github.com/bpatrik/pigallery2/archive/master.zip
unzip master.zip
cd pigallery2-master # enter the unzipped directory
npm install
npm run build
```
Note: It is recommended to create a release version with npm run create-release on a more powerful machine and deploy that to you server.

Note: you can use npm run create-release -- --languages=fr,ro to restrict building to the listed languages (English is added by default)

###Run PiGallery2
```
npm start
```
##AWS Service
 **Resources:**
`aws_instance`
`aws_vpc`
`lambda_function.lambda_handler`
`aws_security_group`
`aws_internet_gateway`
`aws_subnet`
`aws_route_table`
`Access Key`
`aws_route_table_association`
`aws_lb`
`EFS`
`aws_lb`

**AWS Diagram:**
<!-- Screenshots -->
####You can see here the AWS diagram that used in this project.
![image](https://github.com/omrikat/WebSiteProject/blob/main/Aws-diagram.jpg)

###How to Create Cloudformation in AWS Step-By-Step:
1).First you should visit AWS WebSite ==> https://aws.amazon.com/console/
2).login into you'r AWS account, and then go to CloudFormation.
3.

###**This project uses TS Page:**

```

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




<!-- Contact -->
##Contact

[@linkedin](https://www.linkedin.com/in/omri-katesh-1bb491249/) - Omri Katesh
