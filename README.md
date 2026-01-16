# 📋 Job Application Tracker

A minimalistic, privacy-first job application tracker that helps you stay organized during your job search—without complex databases or subscriptions.

![Job Tracker Screenshot](screenshot.png)

## ✨ Features

- 📄 **Upload PDFs** - Extract job details from posting PDFs automatically
- 🔗 **Add URLs** - Manually add job postings with URLs
- 📊 **Status Tracking** - Track applications through Applied → Interview → Offer stages
- 💾 **Import/Export** - Sync data across devices via JSON files
- 📧 **Email Integration** - (Coming soon) Auto-update status from email responses
- 🔒 **Privacy-First** - All data stored locally in your browser
- 📱 **Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Zero Backend** - No servers, no databases, no subscriptions

## 🚀 Live Demo

**[Try it now →](https://your-demo-link.vercel.app)**

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool
- **Web Storage API** - Persistent local storage

## 📦 Installation

### Prerequisites
- Node.js 16+ and npm

### Steps

1. Clone the repository
```bash
git clone https://github.com/yourusername/job-tracker.git
cd job-tracker
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173)

## 🏗️ Build for Production
```bash
npm run build
npm run preview
```

## 📖 Usage Guide

### Adding Applications

**Method 1: Upload PDF**
1. Click "Upload PDF"
2. Select a job posting PDF
3. Review extracted information
4. Click "Add Application"

**Method 2: Manual Entry**
1. Click "Add URL"
2. Enter company name, position, and job URL
3. Click "Add Application"

### Managing Applications

- **Update Status**: Click the status dropdown to change (Applied, Interview, Offer, Rejected, Withdrawn)
- **Delete**: Click the trash icon to remove an application
- **View Posting**: Click "View posting" to open the original job URL

### Syncing Across Devices

**Export (on Device 1)**
1. Click "Export"
2. Save the JSON file
3. Upload to Google Drive or email to yourself

**Import (on Device 2)**
1. Download the JSON file
2. Click "Import"
3. Select the file

## 🔐 Privacy & Security

- ✅ **All data stored locally** - Nothing sent to external servers
- ✅ **No tracking or analytics** - Your data is yours alone
- ✅ **Input sanitization** - XSS prevention built-in
- ✅ **URL validation** - Only safe HTTP/HTTPS links allowed
- ✅ **No third-party dependencies for storage** - Pure Web Storage API

## 🏗️ Project Structure
```
job-tracker/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # React entry point
│   └── index.css        # Tailwind imports
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Test on multiple browsers before submitting
- Update README if adding new features

## 🐛 Known Issues & Roadmap

### Current Limitations
- PDF parsing is basic (plain text extraction only)
- Email monitoring is simulated (OAuth integration pending)

### Roadmap
- [ ] Google Drive auto-sync
- [ ] Gmail/Outlook OAuth integration
- [ ] Email sentiment analysis (auto-detect rejections/offers)
- [ ] Analytics dashboard (applications over time)
- [ ] Chrome extension version
- [ ] Mobile app (React Native)
- [ ] Collaborative mode (share with career coach)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Name](https://linkedin.com/in/yourprofile)
- Website: [yourwebsite.com](https://yourwebsite.com)

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)
- Built with [Vite](https://vitejs.dev/)

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/job-tracker?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/job-tracker?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/job-tracker)
![GitHub license](https://img.shields.io/github/license/yourusername/job-tracker)

---

**⭐ If this project helped you, please give it a star!**

Made with ❤️ for job seekers everywhere
```

---

### **3. `LICENSE` (MIT)**
```
MIT License

Copyright (c) 2025 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.