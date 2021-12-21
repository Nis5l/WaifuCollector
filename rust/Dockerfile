FROM rust:1.56.1 as builder

WORKDIR server
COPY ./Cargo.toml ./Cargo.toml
COPY ./Cargo.lock ./Cargo.lock
COPY ./src/ ./src/
RUN cargo build --release

FROM ubuntu:latest
RUN apt-get update -y 
RUN apt-get install libssl-dev -y
WORKDIR server
COPY --from=builder /server/target/release/ ./
COPY ./Config.json ./Config.json
COPY ./sqlfiles/ ./sqlfiles/
COPY ./static/ ./static/
EXPOSE 80
CMD ["./WaifuCollector"]
