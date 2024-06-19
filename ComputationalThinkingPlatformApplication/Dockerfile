# Use an official OpenJDK runtime as a parent image
FROM openjdk:19
FROM maven:3.9.6

# Set the working directory in the container
WORKDIR /usr/src/backend
COPY . .

RUN mvn install
RUN mvn package

CMD ["java", "-jar", "target/testforpj.jar"]