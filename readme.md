# Invoice Generator with R2 Storage

A modern, production-ready invoice generator built with Next.js that allows users to create, download, and store invoices in Cloudflare R2.

## Features

- 📝 Create professional invoices with a user-friendly interface
- 💾 Download invoices as PDFs
- ☁️ Store invoices in Cloudflare R2
- 🎨 Modern UI with shadcn/ui components
- 📱 Responsive design
- 🔒 Secure file handling

## Tech Stack

- [Next.js 13](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Object storage
- [react-to-pdf](https://www.npmjs.com/package/react-to-pdf) - PDF generation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Cloudflare R2 account and credentials

### Environment Variables

Create a `.env` file in the root directory:
env
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
CLOUDFLARE_R2_ENDPOINT=your_r2_endpoint

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/invoice-generator.git
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Fill in the invoice details (invoice number, date, customer information)
2. Add items with descriptions, quantities, and prices
3. Download the invoice as PDF or upload it to R2 storage
4. Access uploaded invoices through your R2 bucket

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Lucide](https://lucide.dev/) for the icons
- [Cloudflare](https://www.cloudflare.com/) for R2 storage

## Support

For support, please open an issue in the GitHub repository.
