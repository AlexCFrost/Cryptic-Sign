# Cryptic-Sign

### Secure Blockchain Transfers with ECDSA

A blockchain project demonstrating secure fund transfers using Elliptic Curve Digital Signature Algorithm (ECDSA) cryptography and NEXT.js.

### Project Overview

This project implements a client-server system for facilitating secure transfers between blockchain addresses. While the architecture uses a centralized server model for simplicity, it incorporates robust Public Key Cryptography to ensure transaction security.

### Key Features

1. ECDSA Implementation: Uses Elliptic Curve Digital Signatures to validate transaction authenticity

2. Next.js Framework: Utilizes the Next.js framework for building a performant and scalable front-end with server-side rendering and API routes

3. Transaction Verification: Server only processes transfers that have been cryptographically signed by the owner of the sending address

4. Secure Key Management: Demonstrates proper handling of private keys for transaction signing

5. Client-Server Architecture: Clean separation between front-end client and back-end server components

### Technical Details

This cryptographic signatures can secure blockchain transactions even in a centralized environment. Each transaction must be signed with the sender's private key, and the server verifies this signature against the sender's public key before processing the transfer.