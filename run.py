import os
import webbrowser
import subprocess
import time

# Start the HTTP server
print("Starting server on http://localhost:8000...")
server_process = subprocess.Popen(["python", "-m", "http.server"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

# Give the server time to start
time.sleep(2)

# Open the browser
webbrowser.open("http://localhost:8000")

try:
    # Keep the server running
    server_process.wait()
except KeyboardInterrupt:
    print("\nShutting down server...")
    server_process.terminate()

