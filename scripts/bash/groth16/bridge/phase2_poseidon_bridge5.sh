source ./scripts/bash/groth16/phase2_circuit_groth16.sh

compile_phase2 ./build/bridge5 poseidon_bridge_5 ./artifacts/circuits/bridge
move_verifiers_and_metadata ./build/bridge5 5 bridge