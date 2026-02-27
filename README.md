# 🇮🇳 kesp-ui

> **Reusable KYC UI components for Indian fintech apps.**

Stop rebuilding Aadhaar, PAN, and OTP flows in every project.
Built for Indian developers who are tired of recreating the same KYC components again and again.

---

## ✨ Why kesp-ui?

Every Indian fintech or SaaS product needs:

- Aadhaar Input
- PAN Validation
- OTP Flow
- Masked Document Upload

So instead of rebuilding them in every project — **kesp-ui provides production-ready, drop-in components via CLI.**

---

## 🚀 Installation (No Setup Needed)

Just run:

```bash
npx kesp-ui add aadhaar-input
```

That's it. The component gets added directly to your project.

---

## 📦 Available Components

### 1️⃣ Aadhaar Input

- 12-digit validation
- Verhoeff checksum validation
- Auto spacing
- Error states

```bash
npx kesp-ui add aadhaar-input
```

---

### 2️⃣ PAN Card Input

- Live format validation (`ABCDE1234F`)
- Uppercase enforcement
- Instant error feedback

```bash
npx kesp-ui add pan-input
```

---

### 3️⃣ OTP Input

- 6-digit OTP
- Auto focus between fields
- Countdown timer
- Resend button

```bash
npx kesp-ui add otp-input
```

---

### 4️⃣ Masked Aadhaar Upload

- Masked preview
- Blur toggle
- File validation

```bash
npx kesp-ui add masked-aadhar
```

---

## 🛠 All CLI Commands

**List all components**
```bash
npx kesp-ui list
```

**Add a specific component**
```bash
npx kesp-ui add aadhaar-input
npx kesp-ui add pan-input
npx kesp-ui add otp-input
npx kesp-ui add masked-aadhar
```

**Add to custom path** *(Default path: `components/ui`)*
```bash
npx kesp-ui add aadhaar-input --path src/components/ui
# or shorthand
npx kesp-ui add aadhaar-input -p src/components/ui
```

**Check version**
```bash
npx kesp-ui --version
```

**Help**
```bash
npx kesp-ui --help
npx kesp-ui add --help
```

---

## 📥 Import After Installation

```tsx
import AadhaarInput from "@/components/ui/aadhaar-input"
import PanInput from "@/components/ui/pan-input"
import OtpInput from "@/components/ui/otp-input"
import MaskedAadhar from "@/components/ui/maskedAadhar"
```

---

## 🧱 Built With

- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React](https://react.dev/)
- [Next.js](https://nextjs.org/)

Works seamlessly with any **Next.js + Tailwind** setup.

---

## 💡 Who Is This For?

- Fintech startups
- SaaS builders
- Indie developers
- Hackathon participants
- Indian product teams

If you're building for Indian users, this saves hours every time.

---

## 🔮 Roadmap (Community Driven)

Upcoming components being considered:

- [ ] IFSC Validator
- [ ] GST Input
- [ ] Bank Account Validator
- [ ] UPI ID Input
- [ ] Indian Phone Number Input (+91 format)

Got suggestions? [Open an issue](../../issues) or comment 👇

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Add your component
4. Submit a PR

Let's build the Indian component registry together 🇮🇳