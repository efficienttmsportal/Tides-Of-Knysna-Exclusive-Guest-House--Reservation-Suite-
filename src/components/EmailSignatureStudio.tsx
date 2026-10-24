import React, { useState, useRef } from 'react';
import { 
  Mail, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  Building2, 
  User, 
  Phone, 
  Globe, 
  MapPin, 
  ExternalLink, 
  HelpCircle, 
  CheckCircle2, 
  Laptop, 
  Smartphone,
  Share2,
  Palette
} from 'lucide-react';
import { CompanyInfoData } from './CompanyInfoModule';

interface EmailSignatureStudioProps {
  companyInfo: CompanyInfoData;
}

export const EmailSignatureStudio: React.FC<EmailSignatureStudioProps> = ({ companyInfo }) => {
  // Employee details state
  const [employeeName, setEmployeeName] = useState(companyInfo.salesPerson || 'Eleanor Sterling');
  const [employeeTitle, setEmployeeTitle] = useState('Director of Guest Experience & Reservations');
  const [department, setDepartment] = useState('Executive Management');
  const [employeeEmail, setEmployeeEmail] = useState(companyInfo.email || 'reservations@tidesofknysna.co.za');
  const [directPhone, setDirectPhone] = useState('+27 (0)44 382 9000');
  const [mobilePhone, setMobilePhone] = useState('+27 (0)82 555 1892');
  const [websiteUrl, setWebsiteUrl] = useState(companyInfo.webAddress || 'https://www.tidesofknysna.co.za');
  
  // Company override / branding
  const [companyName, setCompanyName] = useState(companyInfo.name || 'Tides of Knysna Luxury Guest Estate');
  const [tagline, setTagline] = useState(companyInfo.tagline || 'Exclusive Lagoon Sanctuary & Boutique Suites');
  const [address, setAddress] = useState(companyInfo.address || '42 Leisure Isle, Knysna Lagoon, Western Cape, South Africa');
  const [logoUrl, setLogoUrl] = useState(companyInfo.logoUrl || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=160&auto=format&fit=crop&q=80');
  
  // Design options
  const [template, setTemplate] = useState<'modern' | 'executive' | 'vertical' | 'twocolumn'>('modern');
  const [accentColor, setAccentColor] = useState<'gold' | 'emerald' | 'navy' | 'burgundy' | 'slate'>('gold');
  const [includeBanner, setIncludeBanner] = useState(true);
  const [bannerText, setBannerText] = useState('✨ Exclusive Direct Booking Reward: Save 15% on your next lagoon suite escape');
  const [bannerUrl, setBannerUrl] = useState(companyInfo.webAddress || 'https://www.tidesofknysna.co.za');

  // Social links
  const [showSocials, setShowSocials] = useState(true);
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/company/tides-of-knysna');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/tidesofknysna');
  const [tripadvisorUrl, setTripadvisorUrl] = useState('https://tripadvisor.com');

  // UI state
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedPlainText, setCopiedPlainText] = useState(false);
  const [activeClientGuide, setActiveClientGuide] = useState<'gmail' | 'outlook' | 'yahoo'>('gmail');
  
  const previewRef = useRef<HTMLDivElement>(null);

  // Color mappings
  const colorMap = {
    gold: { primary: '#D4AF37', secondary: '#997A15', bg: '#FDFBF7', border: '#E6DCBF' },
    emerald: { primary: '#047857', secondary: '#065F46', bg: '#F0FDF4', border: '#A7F3D0' },
    navy: { primary: '#1E3A8A', secondary: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' },
    burgundy: { primary: '#831843', secondary: '#9F1239', bg: '#FFF1F2', border: '#FECDD3' },
    slate: { primary: '#334155', secondary: '#1E293B', bg: '#F8FAFC', border: '#E2E8F0' },
  };

  const currentColors = colorMap[accentColor];

  // Generate robust HTML table for email clients (Gmail, Outlook, Yahoo)
  const generateSignatureHtml = () => {
    const pColor = currentColors.primary;
    const sColor = currentColors.secondary;

    const socialIconsHtml = showSocials ? `
      <table cellpadding="0" cellspacing="0" border="0" style="margin-top: 10px;">
        <tr>
          <td style="padding-right: 8px;">
            <a href="${linkedinUrl}" target="_blank" style="text-decoration: none; display: inline-block; background-color: ${pColor}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold;">LinkedIn</a>
          </td>
          <td style="padding-right: 8px;">
            <a href="${instagramUrl}" target="_blank" style="text-decoration: none; display: inline-block; background-color: ${pColor}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold;">Instagram</a>
          </td>
          <td>
            <a href="${tripadvisorUrl}" target="_blank" style="text-decoration: none; display: inline-block; background-color: ${pColor}; color: #ffffff; padding: 4px 8px; border-radius: 4px; font-family: Arial, sans-serif; font-size: 10px; font-weight: bold;">TripAdvisor</a>
          </td>
        </tr>
      </table>
    ` : '';

    const bannerHtml = includeBanner ? `
      <tr>
        <td colspan="2" style="padding-top: 12px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: ${currentColors.bg}; border: 1px solid ${currentColors.border}; border-radius: 6px;">
            <tr>
              <td style="padding: 8px 12px; font-family: Arial, sans-serif; font-size: 11px; color: ${sColor};">
                <a href="${bannerUrl}" target="_blank" style="color: ${pColor}; text-decoration: none; font-weight: bold;">${bannerText} &raquo;</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    ` : '';

    if (template === 'modern') {
      return `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, Helvetica, sans-serif; font-size: 13px; line-height: 1.4; color: #333333; width: 100%; max-width: 500px;">
          <tr>
            <td valign="top" style="padding-right: 15px; width: 80px;">
              <img src="${logoUrl}" alt="${companyName}" width="70" height="70" style="display: block; border-radius: 8px; object-fit: cover; border: 1px solid ${currentColors.border};" />
            </td>
            <td valign="top" style="border-left: 2px solid ${pColor}; padding-left: 15px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 16px; font-weight: bold; color: #111111; font-family: Georgia, serif;">
                    ${employeeName}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; font-weight: bold; color: ${pColor}; padding-bottom: 4px;">
                    ${employeeTitle} <span style="color: #888888; font-weight: normal;">|</span> ${department}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; font-weight: bold; color: #222222; padding-bottom: 6px;">
                    ${companyName}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #555555; padding-bottom: 2px;">
                    <strong>E:</strong> <a href="mailto:${employeeEmail}" style="color: ${pColor}; text-decoration: none;">${employeeEmail}</a>
                    &nbsp;|&nbsp; <strong>W:</strong> <a href="${websiteUrl}" target="_blank" style="color: ${pColor}; text-decoration: none;">${websiteUrl.replace(/^https?:\/\//, '')}</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #555555; padding-bottom: 2px;">
                    <strong>Direct:</strong> ${directPhone} &nbsp;|&nbsp; <strong>Mobile:</strong> ${mobilePhone}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #666666; padding-top: 2px;">
                    📍 ${address}
                  </td>
                </tr>
              </table>
              ${socialIconsHtml}
            </td>
          </tr>
          ${bannerHtml}
        </table>
      `;
    } else if (template === 'executive') {
      return `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Georgia, serif; font-size: 13px; line-height: 1.4; color: #222222; width: 100%; max-width: 500px; background-color: ${currentColors.bg}; border: 1px solid ${currentColors.border}; padding: 12px; border-radius: 8px;">
          <tr>
            <td valign="top" style="padding-right: 15px; width: 75px; text-align: center;">
              <img src="${logoUrl}" alt="${companyName}" width="65" height="65" style="display: block; border-radius: 50%; object-fit: cover; border: 2px solid ${pColor}; margin: 0 auto;" />
              <div style="font-size: 9px; color: ${sColor}; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; font-weight: bold;">5-Star Luxury</div>
            </td>
            <td valign="top" style="padding-left: 10px; border-left: 1px solid ${currentColors.border};">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 17px; font-weight: bold; color: #111111;">
                    ${employeeName}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; font-style: italic; color: ${pColor}; padding-bottom: 4px;">
                    ${employeeTitle}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; font-weight: bold; color: #333333; padding-bottom: 6px; border-bottom: 1px solid ${currentColors.border};">
                    ${companyName} — <span style="font-weight: normal; color: #666;">${tagline}</span>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #444444; padding-top: 6px; font-family: Arial, sans-serif;">
                    📧 <a href="mailto:${employeeEmail}" style="color: ${pColor}; text-decoration: none;">${employeeEmail}</a> &nbsp;|&nbsp; 📞 ${directPhone}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #555555; padding-top: 2px; font-family: Arial, sans-serif;">
                    🌐 <a href="${websiteUrl}" target="_blank" style="color: ${pColor}; text-decoration: none;">${websiteUrl.replace(/^https?:\/\//, '')}</a> &nbsp;|&nbsp; 📍 ${address}
                  </td>
                </tr>
              </table>
              ${socialIconsHtml}
            </td>
          </tr>
          ${bannerHtml}
        </table>
      `;
    } else if (template === 'vertical') {
      return `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #333333; width: 100%; max-width: 450px; text-align: center;">
          <tr>
            <td align="center" style="padding-bottom: 10px;">
              <img src="${logoUrl}" alt="${companyName}" width="60" height="60" style="display: block; border-radius: 8px; object-fit: cover; margin: 0 auto; border: 1px solid ${currentColors.border};" />
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 16px; font-weight: bold; color: #111111; font-family: Georgia, serif;">
              ${employeeName}
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 12px; color: ${pColor}; font-weight: bold; padding-bottom: 4px;">
              ${employeeTitle}
            </td>
          </tr>
          <tr>
            <td align="center" style="font-size: 12px; color: #555555; padding-bottom: 8px; border-bottom: 1px solid #eeeeee;">
              <strong>${companyName}</strong><br/>
              <a href="mailto:${employeeEmail}" style="color: ${pColor}; text-decoration: none;">${employeeEmail}</a> &bull; ${directPhone} &bull; <a href="${websiteUrl}" target="_blank" style="color: ${pColor}; text-decoration: none;">Website</a>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-top: 6px; font-size: 11px; color: #666666;">
              📍 ${address}
            </td>
          </tr>
          <tr>
            <td align="center">
              ${socialIconsHtml}
            </td>
          </tr>
          ${bannerHtml}
        </table>
      `;
    } else {
      // Two Column Card
      return `
        <table cellpadding="0" cellspacing="0" border="0" style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.4; color: #333333; width: 100%; max-width: 500px; border-top: 3px solid ${pColor}; border-bottom: 1px solid ${currentColors.border}; padding: 10px 0;">
          <tr>
            <td valign="middle" style="width: 110px; padding-right: 15px; border-right: 1px solid ${currentColors.border}; text-align: center;">
              <img src="${logoUrl}" alt="${companyName}" width="90" height="50" style="display: block; object-fit: contain; margin: 0 auto;" />
              <div style="font-size: 10px; font-weight: bold; color: ${sColor}; margin-top: 4px;">${department}</div>
            </td>
            <td valign="middle" style="padding-left: 15px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size: 16px; font-weight: bold; color: #111; font-family: Georgia, serif;">
                    ${employeeName}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: ${pColor}; font-weight: bold; padding-bottom: 4px;">
                    ${employeeTitle}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #444; padding-bottom: 2px;">
                    📞 Dir: ${directPhone} | Mob: ${mobilePhone}
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 12px; color: #444; padding-bottom: 2px;">
                    ✉️ <a href="mailto:${employeeEmail}" style="color: ${pColor}; text-decoration: none;">${employeeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 11px; color: #666;">
                    🌐 <a href="${websiteUrl}" target="_blank" style="color: ${pColor}; text-decoration: none;">${websiteUrl.replace(/^https?:\/\//, '')}</a>
                  </td>
                </tr>
              </table>
              ${socialIconsHtml}
            </td>
          </tr>
          ${bannerHtml}
        </table>
      `;
    }
  };

  const fullHtml = generateSignatureHtml();

  // Copy HTML to clipboard with MIME type text/html so email clients paste it formatted
  const handleCopyHtml = async () => {
    try {
      const blobHtml = new Blob([fullHtml], { type: 'text/html' });
      const blobText = new Blob([
        `${employeeName}\n${employeeTitle} | ${department}\n${companyName}\nEmail: ${employeeEmail} | Phone: ${directPhone}\nWeb: ${websiteUrl}\n${address}`
      ], { type: 'text/plain' });

      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': blobHtml,
          'text/plain': blobText,
        })
      ]);
      setCopiedHtml(true);
      setTimeout(() => setCopiedHtml(false), 3000);
    } catch (err) {
      // Fallback for browsers that restrict clipboard items
      try {
        await navigator.clipboard.writeText(fullHtml);
        setCopiedHtml(true);
        setTimeout(() => setCopiedHtml(false), 3000);
      } catch (fallbackErr) {
        alert('Failed to copy signature. Please select and copy from the preview box below.');
      }
    }
  };

  // Copy Plain Text
  const handleCopyPlainText = () => {
    const text = `${employeeName}\n${employeeTitle} | ${department}\n${companyName}\nEmail: ${employeeEmail} | Phone: ${directPhone} | Mobile: ${mobilePhone}\nWebsite: ${websiteUrl}\nAddress: ${address}`;
    navigator.clipboard.writeText(text);
    setCopiedPlainText(true);
    setTimeout(() => setCopiedPlainText(false), 2500);
  };

  // Download HTML file
  const handleDownloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Signature - ${employeeName}</title>
      </head>
      <body style="background-color: #f5f5f5; padding: 30px;">
        <div style="background-color: #ffffff; padding: 25px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 600px; margin: 0 auto;">
          <p style="font-family: sans-serif; font-size: 12px; color: #666; margin-bottom: 20px;">
            <strong>Instructions:</strong> Select the signature below, press <strong>Ctrl+C</strong> (or Cmd+C), and paste directly into your email client settings (Gmail / Outlook / Yahoo).
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin-bottom: 20px;"/>
          
          ${fullHtml}
        </div>
      </body>
      </html>
    `], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `email-signature-${employeeName.toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 border border-emerald-500/30 shadow-xl text-white flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Corporate Identity Studio
            </span>
            <span className="text-xs text-slate-400">| Gmail, Outlook & Yahoo Compatible</span>
          </div>
          <h2 className="text-2xl font-serif-luxury font-bold text-white tracking-tight">
            Email Signature Studio & Generator
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl">
            Create professional, responsive email signatures with incorporated company branding and logos. 
            Instantly copy formatted HTML for direct insertion into Gmail, Outlook (Desktop & Web), and Yahoo Mail.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleCopyHtml}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-900/40 transition"
          >
            {copiedHtml ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            {copiedHtml ? 'Copied HTML & Rich Text!' : 'Copy Formatted Signature'}
          </button>
          <button
            onClick={handleDownloadHtml}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Download HTML File
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Template & Theme Selector */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif-luxury">
                <Palette className="w-4 h-4 text-emerald-400" />
                Layout Template & Brand Palette
              </h3>
              <span className="text-xs text-slate-400">4 Professional Styles</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'modern', name: 'Modern Minimal', desc: 'Sleek side accent' },
                { id: 'executive', name: 'Executive Luxe', desc: 'Bordered card' },
                { id: 'vertical', name: 'Vertical Badge', desc: 'Centered header' },
                { id: 'twocolumn', name: 'Two-Column Card', desc: 'Logo divider' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition space-y-1 ${
                    template === t.id 
                      ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50' 
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  <div className="text-[10px] text-slate-400">{t.desc}</div>
                </button>
              ))}
            </div>

            {/* Accent Color Picker */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-300 block mb-2">Brand Accent Theme Color</label>
              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { id: 'gold', name: 'Luxe Gold', color: '#D4AF37' },
                  { id: 'emerald', name: 'Lagoon Emerald', color: '#047857' },
                  { id: 'navy', name: 'Ocean Navy', color: '#1E3A8A' },
                  { id: 'burgundy', name: 'Wine Burgundy', color: '#831843' },
                  { id: 'slate', name: 'Executive Slate', color: '#334155' },
                ].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setAccentColor(c.id as any)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
                      accentColor === c.id 
                        ? 'bg-slate-800 border-white text-white shadow' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Employee Details Form */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif-luxury">
                <User className="w-4 h-4 text-emerald-400" />
                Employee Details
              </h3>
              <span className="text-xs text-slate-400">Personalize signature</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Job Title / Role</label>
                <input
                  type="text"
                  value={employeeTitle}
                  onChange={(e) => setEmployeeTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Department / Division</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Direct Email Address</label>
                <input
                  type="email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Direct Office Phone</label>
                <input
                  type="text"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Mobile / WhatsApp</label>
                <input
                  type="text"
                  value={mobilePhone}
                  onChange={(e) => setMobilePhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Company Info & Logo */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif-luxury">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Company Branding & Logo
              </h3>
              <span className="text-xs text-slate-400">Estate Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Company / Estate Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Company Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300 block mb-1">Logo / Crest Image URL</label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Provide a secure HTTPS image URL (PNG, JPG, or SVG emblem).</p>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-300 block mb-1">Estate Physical Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Promotional Banner Toggle */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Include Promotional Banner / CTA</h4>
                  <p className="text-[11px] text-slate-400">Add a clickable direct booking incentive footer to outbound emails.</p>
                </div>
                <input
                  type="checkbox"
                  checked={includeBanner}
                  onChange={(e) => setIncludeBanner(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              {includeBanner && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Banner Text Call to Action</label>
                    <input
                      type="text"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-300 block mb-1">Banner Link URL</label>
                    <input
                      type="text"
                      value={bannerUrl}
                      onChange={(e) => setBannerUrl(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview & Mail Client Setup Guides (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Preview Box */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif-luxury">
                <Laptop className="w-4 h-4 text-emerald-400" />
                Live Email Signature Preview
              </h3>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                WYSIWYG
              </span>
            </div>

            {/* The white card container matching email clients */}
            <div 
              ref={previewRef}
              className="bg-white rounded-xl p-4 shadow-inner text-slate-900 overflow-x-auto border border-slate-300"
              dangerouslySetInnerHTML={{ __html: fullHtml }}
            />

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopyHtml}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition"
              >
                {copiedHtml ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedHtml ? 'Copied to Clipboard!' : 'Copy Formatted Signature'}
              </button>
              <button
                onClick={handleCopyPlainText}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2.5 rounded-xl text-xs font-semibold transition"
                title="Copy plain text fallback"
              >
                {copiedPlainText ? 'Copied Text!' : 'Plain Text'}
              </button>
            </div>
          </div>

          {/* Mail Client Setup Instructions */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-serif-luxury">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                How to Install in Email Clients
              </h3>
              <div className="flex items-center gap-1">
                {(['gmail', 'outlook', 'yahoo'] as const).map(client => (
                  <button
                    key={client}
                    onClick={() => setActiveClientGuide(client)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      activeClientGuide === client 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {client}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-3 bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              {activeClientGuide === 'gmail' && (
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click the <strong className="text-emerald-400">"Copy Formatted Signature"</strong> button above.</li>
                  <li>Open <strong className="text-white">Gmail</strong>, click the <strong>Gear icon (Settings)</strong> &gt; <strong>See all settings</strong>.</li>
                  <li>Scroll down to the <strong className="text-white">"Signature"</strong> section and click <strong>Create new</strong>.</li>
                  <li>Click inside the signature edit box and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Ctrl + V</kbd> (or Cmd + V) to paste.</li>
                  <li>Scroll to the bottom and click <strong className="text-emerald-400">Save Changes</strong>.</li>
                </ol>
              )}

              {activeClientGuide === 'outlook' && (
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click <strong className="text-emerald-400">"Copy Formatted Signature"</strong> above.</li>
                  <li>Open <strong className="text-white">Outlook</strong>, go to <strong>File</strong> &gt; <strong>Options</strong> &gt; <strong>Mail</strong> &gt; <strong>Signatures</strong> (or Settings &gt; Mail &gt; Compose and reply).</li>
                  <li>Click <strong>New</strong> and name your signature.</li>
                  <li>In the edit signature text box, press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Ctrl + V</kbd> to paste the formatted HTML signature.</li>
                  <li>Select your default signature for new messages and replies, then click <strong>Save</strong>.</li>
                </ol>
              )}

              {activeClientGuide === 'yahoo' && (
                <ol className="list-decimal list-inside space-y-2">
                  <li>Click <strong className="text-emerald-400">"Copy Formatted Signature"</strong> above.</li>
                  <li>Open <strong className="text-white">Yahoo Mail</strong>, click <strong>Settings</strong> (Gear icon) &gt; <strong>More Settings</strong>.</li>
                  <li>Select <strong className="text-white">Writing email</strong> tab on the left.</li>
                  <li>Toggle on the signature switch for your email address.</li>
                  <li>Click inside the text field and press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-300">Ctrl + V</kbd> to paste the signature, then click <strong>Save</strong>.</li>
                </ol>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
