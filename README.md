# Metsoalle

Metsoalle is a social media app built for people who miss the simple, personal side of the internet, think of it as a digital scrapbook shared only with the people you actually know. Instead of an endless stream of viral videos from strangers, you get a clean, chronological feed of image and video carousels from your real-life friends. It strips away the overwhelming "Explore" pages and noisy algorithms, focusing instead on the essentials: a dedicated space to upload your favorite moments, a search tool to find your circle, and direct messaging to keep the conversation going. It’s not about becoming an influencer; it’s about staying connected with your community, one post at a time.

## Features

- Chronological feed with no engagement-driven algorithms
- Image and video carousel posts for sharing memories
- Friend-focused social experience without public discovery pages
- Direct messaging between users
- Search functionality to find and connect with friends
- Lightweight architecture using only built-in Node.js libraries
- Multi-subdomain structure for API, app, resources, and landing pages
- Self-hostable on Debian-based Linux environments

## Installation

Setting up your **Metsoalle** environment on **Debian 13 (Trixie)** is a great way to ensure a clean, isolated development space. This guide covers the VM setup, the terminal configuration, and the final networking tweaks.

### Phase 1: Virtual Machine Setup

Before running commands, you need a functional Debian environment. You can use VirtualBox, VMware, or Proxmox.

1. **Download the ISO:** Grab the Debian 13 "netinst" ISO from the official Debian website.

2. **Create the VM:**

- **RAM:** At least 2GB (4GB recommended).
- **Storage:** 20GB+.
- **Network:** Set to **Bridged Adapter** if you want it accessible on your local network, or **NAT with Port Forwarding** (port 80/443).

3. **Installation Tips:**

- When prompted for "Software selection," ensure **SSH Server** and **Standard System Utilities** are checked.
- You can skip the Desktop Environment (GNOME/KDE) to keep the VM lightweight.

---

### Phase 2: System Update & Dependencies

Once you log in to your Debian terminal, follow these steps to prepare the system.

#### 1. Elevate Privileges and Update

Debian 13 stays secure by keeping packages updated.

```bash
su root
apt update && apt upgrade -y
```

#### 2. Install Core Tools

You'll need `curl`, `git`, and `openssl`.

```bash
apt install curl git -y
```

---

### Phase 3: Node.js Environment (via NVM)

Using **Node Version Manager (NVM)** is the best practice to avoid permission issues and keep Node.js versions isolated.

#### 1. Install NVM

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
```

#### 2. Refresh Environment

Instead of logging out, load NVM into your current session:

```bash
\. "$HOME/.nvm/nvm.sh"
```

#### 3. Install Node.js 24

```bash
nvm install 24
node -v
```

---

### Phase 4: SSL Certificate Setup

Generate a self-signed wildcard SSL certificate for local development:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/com.metsoalle.key -out /etc/ssl/certs/com.metsoalle.crt -subj "/C=ZA/ST=Gauteng/L=City of Tshwane/O=Metsoalle/OU=Software Development/CN=*.metsoalle.com/emailAddress=webmaster@metsoalle.com"
```

---

### Phase 5: Deploying Metsoalle

Move the source code to the `/srv/` directory, which is the standard location for site data on Linux.

```bash
cd /tmp/
git clone https://github.com/omphilemagane/metsoalle.git

# Move files to the service directory
cp -r metsoalle/. /srv/

cd /srv/

# Start the application
node index.js
```

---

### Phase 6: Network Configuration (Host Machine)

For your browser to recognize `metsoalle.com`, you must tell your **physical host computer** where the VM is located.

#### 1. Find the VM IP

In the Debian terminal, type:

```bash
ip addr
```

Look for the `inet` address (example: `192.168.1.50`).

#### 2. Edit the Hosts File

- **Windows:** Run Notepad as Administrator and open:

```text
C:\Windows\System32\drivers\etc\hosts
```

- **macOS/Linux:**

```bash
sudo nano /etc/hosts
```

#### 3. Add These Lines

```text
192.168.1.50 metsoalle.com
192.168.1.50 api.metsoalle.com
192.168.1.50 app.metsoalle.com
192.168.1.50 res.metsoalle.com
192.168.1.50 www.metsoalle.com
```

> **Note:** If you are running `node index.js` as a non-root user, the app might not be able to bind to port 80 or 443. You may need to use `sudo node index.js` or configure a reverse proxy such as Nginx for production-style deployments.

## Usage

```bash
# Run the project
node /srv/index.js
```

## Technologies Used

- Node.js (built-in modules only)
- HTML5
- CSS3
- Vanilla JavaScript
- OpenSSL
- Debian Linux

## Project Structure

```bash
metsoalle/
│── api/         # API end-points for the application.
│── app/         # Static application files (HTML).
│── res/         # Static resource files (images, fonts, etc.).
│── www/         # Static landing page for the application.
│── index.js     # Main entry point of application.
│── LICENSE
│── README.md
```

## Contributing

Contributions are welcome. Feel free to fork the project and submit a pull request.

## License

This project is licensed under the [Business Source License 1.1](https://spdx.org/licenses/BUSL-1.1.html) License.

## Author

- Omphile K. Magane
- GitHub: [@omphilemagane](https://github.com/omphilemagane)