import { ShieldCheck } from "lucide-react";
import "../../styles/license.css";

function License() { return <div className="license-page zt-subpage"><section className="zt-page-hero"><span>ZEROTRACE / OPEN SOURCE</span><h1>MIT <em>License</em></h1><p>ZeroTrace is distributed under the MIT License, allowing reuse with attribution and the license notice preserved.</p></section><section className="license-card"><div className="license-heading"><ShieldCheck /><div><span>LICENSE / MIT</span><h2>Copyright (c) 2026 ZeroTrace</h2></div></div><pre>{`Permission is hereby granted, free of charge, to any person obtaining a copy
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
SOFTWARE.`}</pre></section></div>; }
export default License;
