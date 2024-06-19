# 使用官方 Maven 镜像（包括 JDK 17）作为构建环境
FROM maven:3.9.6 AS build

# 设置工作目录
WORKDIR /app

# 将 pom.xml 和源码复制到镜像中
COPY pom.xml .
COPY src ./src

# 打包应用，跳过测试
RUN mvn clean package -DskipTests

# 使用 OpenJDK 17 镜像来运行编译好的应用
FROM openjdk:17

WORKDIR /app

# 从构建阶段复制编译好的文件到当前镜像中
COPY --from=build /app/target/*.jar app.jar

# 暴露端口
EXPOSE 8080

# 设置容器启动后执行的命令
CMD ["java", "-jar", "app.jar"]