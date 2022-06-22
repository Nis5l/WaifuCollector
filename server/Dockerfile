FROM rust:1.57.0 as builder

WORKDIR server
COPY ./Cargo.toml ./Cargo.toml
COPY ./src/ ./src/
RUN cargo build --release

FROM ubuntu:18.04
RUN apt-get update -y 
RUN apt-get install libssl-dev ca-certificates -y
WORKDIR server
COPY --from=builder /server/target/release/WaifuCollector ./WaifuCollector
COPY ./Config.json ./Config.json
COPY ./sqlfiles/ ./sqlfiles/
COPY ./static/ ./static/
EXPOSE 80
CMD ["./WaifuCollector"]
