.PHONY: dev start gen-proto install install-dev clean

# Start gRPC server with hot-reload
dev:
	uv run src/server.py --reload

# Start gRPC server (production)
start:
	uv run src/server.py

# Regenerate protobuf files from ai.proto
gen-proto:
	uv run --group dev python -m grpc_tools.protoc \
		-I../proto \
		--python_out=src \
		--grpc_python_out=src \
		--pyi_out=src \
		../proto/ai.proto

# Install production dependencies
install:
	uv sync

# Install all dependencies (including dev)
install-dev:
	uv sync --group dev

# Remove generated proto files
clean:
	rm -f src/ai_pb2.py src/ai_pb2_grpc.py src/ai_pb2.pyi
