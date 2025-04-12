pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION = 'ap-southeast-2'
        AWS_ACCOUNT_ID = '417650894705'
        IMAGE_REPO_NAME = 'translator-api'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Docker Image') {
            steps {
                script {
                    def shortCommit = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = shortCommit

                    withCredentials([
                        usernamePassword(credentialsId: 'aws-access', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        sh '''
                            aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com
                            docker build -t $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG .
                            docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG
                        '''
                    }
                }
            }
        }

        stage('Deploy to ECS') {
            steps {
                script {
                    withCredentials([
                        file(credentialsId: 'ifa-env-file', variable: 'ENV_FILE'),
                        usernamePassword(credentialsId: 'aws-access', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY')
                    ]) {
                        def envVars = readFile(ENV_FILE).split("\n").findAll { it.trim() && !it.startsWith("#") }.collectEntries {
                            def (key, value) = it.split("=", 2)
                            [(key.trim()): value.trim()]
                        }

                        def containerEnv = envVars.collect { key, value ->
                            [name: key, value: value]
                        }

                        def taskDef = [
                            family: "translator-task",
                            networkMode: "awsvpc",
                            requiresCompatibilities: ["FARGATE"],
                            cpu: "512",
                            memory: "1024",
                            executionRoleArn: "arn:aws:iam::$AWS_ACCOUNT_ID:role/ecsTaskExecutionRoleTerraform",
                            containerDefinitions: [[
                                name: "translator-api",
                                image: "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/$IMAGE_REPO_NAME:$IMAGE_TAG",
                                essential: true,
                                portMappings: [[ containerPort: 8000, hostPort: 8000, protocol: "tcp" ]],
                                environment: containerEnv
                            ]]
                        ]

                        writeJSON file: 'taskdef.json', json: taskDef, pretty: 4

                        sh '''
                            aws ecs register-task-definition --cli-input-json file://taskdef.json
                            aws ecs update-service --cluster translator-cluster --service translator-service --force-new-deployment
                        '''
                    }
                }
            }
        }
    }
}
