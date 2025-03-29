pipeline {
    agent any
    environment {
        NODEJS_HOME = tool name: 'NodeJS 20.10.0'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
    }
    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'Devops-David', url: 'https://github.com/Innovate-Future-Association-Translation/translator-api.git'
            }
        }
        stage('Create .env File') {
            steps {
                writeFile file: '.env', text: '''
                PORT=8000
                DATABASE_URL=mongodb+srv://IFA-developer:theQuickBrownFoxJumpAwayTheLazyDog@ifa-database.78miq.mongodb.net/?retryWrites=true&w=majority&appName=IFA-database
                API_PREFIX=/api/v1
                SWAGGER_DOC_PATH=/api-docs
                JWT_SECRET=aQuickBrownFoxJumpAwayALazyDog
                '''
            }
        }
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }
        stage('Run Application') {
            steps {
                sh 'npm run dev'
            }
        }
    }
}
