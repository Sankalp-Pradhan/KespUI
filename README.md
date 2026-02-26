# kesp-ui

A collection of Indian-specific UI components for Next.js + Tailwind CSS projects.

## Usage

```bash
npx kesp-ui add aadhaar-input
npx kesp-ui add pan-input
```

## Available Components

| Component | Description |
|---|---|
| `aadhaar-input` | Validated Aadhaar number input with Verhoeff checksum |
| `pan-input` | Validated PAN Card input with segment progress bars |

## List all components

```bash
npx kesp-ui list
```

## Custom output path

By default components are added to `components/ui/`. You can change this:

```bash
npx kesp-ui add aadhaar-input --path src/components/forms
```

## Example

```tsx
import AadhaarInput from "@/components/ui/aadhaar-input";
import PanCardInput from "@/components/ui/pan-input";

export default function Page() {
  return (
    <div>
      <AadhaarInput label="Enter Aadhaar" onChange={(val) => console.log(val)} />
      <PanCardInput label="Enter PAN" onValid={(val) => console.log(val)} />
    </div>
  );
}
```
