import svgPaths from "./svg-8ymeotz4bj";
import imgElipse6 from "figma:asset/b940caf9f3a52bcc9317c793ebc094db911b237b.png";
import { imgElipse5, imgElipse7 } from "./svg-lv98i";

function Avatar() {
  return (
    <div className="absolute contents inset-0" data-name="Avatar">
      <div className="absolute inset-[-10%_-1.43%_-30%_-10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[4.1px] mask-size-[41px_41px]" data-name="Elipse 5" style={{ maskImage: `url('${imgElipse5}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgElipse6} />
      </div>
      <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[41px_41px]" style={{ maskImage: `url('${imgElipse5}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Ellipse 5"></g>
        </svg>
      </div>
    </div>
  );
}

function AvatarStyle6() {
  return (
    <div className="absolute left-[1848px] size-[41px] top-[67px]" data-name="Avatar Style 6">
      <Avatar />
    </div>
  );
}

function InfoOutline() {
  return (
    <div className="absolute left-[1804px] size-[24px] top-[75px]" data-name="info_outline">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_283)" id="info_outline">
          <g id="Group">
            <g id="Vector"></g>
            <g id="Vector_2" opacity="0.87"></g>
          </g>
          <path d={svgPaths.p1ea3e200} fill="var(--fill-0, #718096)" id="Vector_3" />
        </g>
        <defs>
          <clipPath id="clip0_1_283">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function MoonSolid1() {
  return (
    <div className="absolute left-[1766px] size-[18px] top-[78px]" data-name="moon-solid 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g clipPath="url(#clip0_1_248)" id="moon-solid 1">
          <path d={svgPaths.pb9b9600} fill="var(--fill-0, #718096)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_248">
            <rect fill="white" height="18" width="18" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function NotificationsNone() {
  return (
    <div className="absolute left-[1722px] size-[24px] top-[75px]" data-name="notifications_none">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_299)" id="notifications_none">
          <g id="Vector"></g>
          <path d={svgPaths.p34be6d80} fill="var(--fill-0, #718096)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_299">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Background() {
  return (
    <div className="absolute contents inset-0" data-name="Background">
      <div className="absolute bg-[#f4f7fe] inset-0 rounded-[49px]" />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute contents left-[42px] top-[calc(50%-0.5px)] translate-y-[-50%]" data-name="Text">
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[20px] left-[42px] text-[#718096] text-[14px] text-nowrap top-[calc(50%-10.5px)] tracking-[-0.28px] whitespace-pre">Search</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <div className="absolute left-[20px] size-[11px] top-1/2 translate-y-[-50%]" data-name="Search Icon">
      <div className="absolute bottom-[-6.36%] left-0 right-0 top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11 12">
          <g id="Search Icon">
            <circle cx="5" cy="5" id="Ellipse 6" r="4.3" stroke="var(--stroke-0, #1B2559)" strokeWidth="1.4" />
            <line id="Line 1" stroke="var(--stroke-0, #1B2559)" strokeLinecap="round" strokeWidth="1.4" x1="10.0101" x2="8" y1="11" y2="8.98995" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function LargeInput() {
  return (
    <div className="absolute h-[41px] left-[1488px] top-[67px] w-[214px]" data-name="Large Input">
      <Background />
      <Text />
      <SearchIcon />
    </div>
  );
}

function Misc() {
  return (
    <div className="absolute contents left-[1478px] top-[57px]" data-name="Misc">
      <div className="absolute bg-white h-[61px] left-[1478px] rounded-[30px] shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] top-[57px] w-[422px]" />
      <AvatarStyle6 />
      <InfoOutline />
      <MoonSolid1 />
      <NotificationsNone />
      <LargeInput />
    </div>
  );
}

function Breadcrumbs() {
  return (
    <div className="absolute contents left-[383px] top-[76px]" data-name="Breadcrumbs">
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none left-[383px] text-[#1b2559] text-[34px] text-nowrap top-[76px] whitespace-pre">Chat UI</p>
    </div>
  );
}

function Menu() {
  return (
    <div className="absolute contents left-[383px] top-[57px]" data-name="Menu">
      <Misc />
      <Breadcrumbs />
    </div>
  );
}

function Links() {
  return (
    <div className="absolute contents font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[24px] left-[1104px] text-[#718096] text-[14px] text-center text-nowrap top-[calc(50%+481px)] translate-y-[-50%] whitespace-pre" data-name="Links">
      <p className="absolute left-[1142.5px] top-[calc(50%+469px)] translate-x-[-50%]">Homepage</p>
      <p className="absolute left-[1242px] top-[calc(50%+469px)] translate-x-[-50%]">License</p>
      <p className="absolute left-[1348.5px] top-[calc(50%+469px)] translate-x-[-50%]">Terms of Use</p>
      <p className="absolute left-[1474px] top-[calc(50%+469px)] translate-x-[-50%]">Privacy Policy</p>
    </div>
  );
}

function Footer() {
  return (
    <div className="absolute contents left-[20px] top-[calc(50%+481px)] translate-y-[-50%]" data-name="Footer">
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[24px] left-[189.5px] text-[#718096] text-[14px] text-center text-nowrap top-[calc(50%+469px)] translate-x-[-50%] whitespace-pre">© 2023 Horizon UI AI Template. All Rights Reserved.</p>
      <Links />
    </div>
  );
}

function Input() {
  return (
    <div className="absolute h-[54px] left-[305px] rounded-[45px] top-[825px] w-[738px]" data-name="Input">
      <div className="h-[54px] overflow-clip relative rounded-[inherit] w-[738px]">
        <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-none left-[20px] text-[#718096] text-[14px] text-nowrap top-[18px] whitespace-pre">Send a message</p>
      </div>
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[45px]" />
    </div>
  );
}

function Button() {
  return (
    <div className="absolute box-border content-stretch flex h-[54px] items-center justify-center left-[1053px] opacity-20 overflow-clip rounded-[45px] shadow-[0px_21px_27px_-10px_rgba(96,60,255,0.48)] top-[825px] w-[192px]" data-name="Button">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold h-[20px] leading-[16px] relative shrink-0 text-[14px] text-white w-[50px]">Submit</p>
    </div>
  );
}

function Background1() {
  return (
    <div className="absolute h-[70px] left-[623px] top-[12px] w-[174px]" data-name="Background">
      <div className="absolute inset-[-31.43%_-36.21%_-108.57%_-20.11%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 272 168">
          <g id="Background">
            <g filter="url(#filter0_d_1_257)" id="Rectangle 3">
              <path d={svgPaths.p28e3d000} fill="var(--fill-0, white)" />
            </g>
            <g id="Frame 44">
              <rect fill="url(#paint0_linear_1_257)" height="39" rx="19.5" width="39" x="60" y="37.5" />
              <g filter="url(#filter1_d_1_257)" id="Vector">
                <path d={svgPaths.p912a900} fill="var(--fill-0, #603CFF)" />
              </g>
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="168" id="filter0_d_1_257" width="272" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feMorphology in="SourceAlpha" operator="dilate" radius="4" result="effect1_dropShadow_1_257" />
              <feOffset dx="14" dy="27" />
              <feGaussianBlur stdDeviation="22.5" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.439216 0 0 0 0 0.564706 0 0 0 0 0.690196 0 0 0 0.2 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_257" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_257" mode="normal" result="shape" />
            </filter>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="97.9" id="filter1_d_1_257" width="96.9" x="31.05" y="40.55">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="32.5" />
              <feGaussianBlur stdDeviation="20.475" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.262745 0 0 0 0 0.0941176 0 0 0 0 1 0 0 0 0.28 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_257" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_257" mode="normal" result="shape" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_257" x1="79.5" x2="79.5" y1="37.5" y2="76.5">
              <stop stopColor="#FBFBFF" />
              <stop offset="1" stopColor="#CACAFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Text1() {
  return (
    <div className="absolute contents left-[697px] top-[38px]" data-name="Text">
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-[18px] left-[697px] text-[#120f43] text-[18px] text-nowrap top-[38px] whitespace-pre">GPT-3.5</p>
    </div>
  );
}

function Gpt35() {
  return (
    <div className="absolute contents left-[623px] top-[12px]" data-name="GPT-3.5">
      <Background1 />
      <Text1 />
    </div>
  );
}

function Frame45() {
  return (
    <div className="absolute left-[819px] opacity-20 size-[39px] top-[27.5px]">
      <div className="absolute bottom-[-158.85%] left-[-69.1%] right-[-69.1%] top-0">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 93 101">
          <g id="Frame 44">
            <rect fill="url(#paint0_linear_1_276)" height="39" rx="19.5" width="39" x="26.95" />
            <g filter="url(#filter0_d_1_276)" id="Bolt">
              <path d={svgPaths.p3be99700} fill="var(--fill-0, #603CFF)" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="97.9" id="filter0_d_1_276" width="92.9" x="0" y="3.05">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="32.5" />
              <feGaussianBlur stdDeviation="20.475" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.262745 0 0 0 0 0.0941176 0 0 0 0 1 0 0 0 0.28 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_276" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_276" mode="normal" result="shape" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_276" x1="46.45" x2="46.45" y1="0" y2="39">
              <stop stopColor="#FBFBFF" />
              <stop offset="1" stopColor="#CACAFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Text2() {
  return (
    <div className="absolute contents left-[868px] top-[38px]" data-name="Text">
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-[18px] left-[868px] opacity-20 text-[#120f43] text-[18px] text-nowrap top-[38px] whitespace-pre">GPT-4</p>
    </div>
  );
}

function Gpt4() {
  return (
    <div className="absolute contents left-[819px] top-[27.5px]" data-name="GPT-4">
      <Frame45 />
      <Text2 />
    </div>
  );
}

function Toggle() {
  return (
    <div className="absolute contents left-1/2 top-[12px] translate-x-[-50%]" data-name="Toggle">
      <Gpt35 />
      <Gpt4 />
    </div>
  );
}

function NoPluginsEnabled() {
  return (
    <div className="absolute contents left-[calc(50%+0.327px)] top-[105px] translate-x-[-50%]" data-name="No plugins enabled">
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[26px] left-[calc(50%-72px)] text-[#718096] text-[14px] text-nowrap top-[calc(50%-388px)] whitespace-pre">No plugins enabled</p>
      <div className="absolute flex inset-[11.81%_45.31%_87.63%_54.09%] items-center justify-center">
        <div className="flex-none h-[9.305px] rotate-[90deg] w-[5.487px]">
          <div className="relative size-full" data-name="Vector">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 10">
              <path d={svgPaths.p1adaacf0} fill="var(--fill-0, #718096)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaveButton() {
  return (
    <div className="absolute bg-gradient-to-b box-border content-stretch flex from-[#7bcbd4] h-[54px] items-center justify-center left-[333px] overflow-clip rounded-[45px] shadow-[0px_21px_27px_-10px_rgba(67,200,192,0.47)] to-[#29c6b7] top-[189px] w-[121px]" data-name="Save button">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold h-[20px] leading-[16px] relative shrink-0 text-[14px] text-white w-[34px]">Save</p>
    </div>
  );
}

function Input1() {
  return (
    <div className="absolute bg-white h-[54px] left-[40px] rounded-[45px] top-[189px] w-[283px]" data-name="Input">
      <div className="h-[54px] overflow-clip relative rounded-[inherit] w-[283px]">
        <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-none left-[20px] text-[#718096] text-[14px] text-nowrap top-[18px] whitespace-pre">sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx</p>
      </div>
      <div aria-hidden="true" className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-[45px]" />
    </div>
  );
}

function YourApiKeyIsNotWorking() {
  return (
    <div className="absolute contents left-[130px] top-[309px]" data-name="Your API Key is not working?">
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-[28px] left-[calc(50%-8.5px)] text-[#1b2559] text-[16px] text-center text-nowrap top-[calc(50%+69px)] translate-x-[-50%] whitespace-pre">Your API Key is not working?</p>
      <div className="absolute flex inset-[67.29%_26.66%_31.57%_71.46%] items-center justify-center">
        <div className="flex-none h-[9.305px] rotate-[90deg] w-[5.487px]">
          <div className="relative size-full" data-name="Vector">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 10">
              <path d={svgPaths.p1adaacf0} fill="var(--fill-0, #1B2559)" id="Vector" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiKeyCard() {
  return (
    <div className="absolute bg-white h-[480px] left-[calc(50%+13px)] overflow-clip rounded-[14px] shadow-[14px_27px_45px_4px_rgba(112,144,176,0.2)] top-[213px] translate-x-[-50%] w-[494px]" data-name="API Key card">
      <SaveButton />
      <Input1 />
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none left-[calc(50%-153px)] text-[#1b2559] text-[24px] text-nowrap top-[calc(50%-197px)] whitespace-pre">Enter your OpenAI API Key</p>
      <div className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[28px] left-1/2 text-[#718096] text-[16px] text-center top-[calc(50%-157px)] translate-x-[-50%] w-[398px]">
        <p className="mb-0">You need an OpenAI API Key to use Horizon Chat UI.</p>
        <p>Your API Key is stored locally on your browser and never sent anywhere else.</p>
      </div>
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[28px] left-1/2 text-[#718096] text-[14px] text-center top-[calc(50%+113px)] translate-x-[-50%] w-[352px]">*The app will connect to OpenAI API server to check if your API Key is working properly.</p>
      <p className="absolute font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold leading-[28px] left-1/2 text-[#603cff] text-[14px] text-center text-nowrap top-[calc(50%+25px)] translate-x-[-50%] whitespace-pre">Get your API key from Open AI Dashboard</p>
      <YourApiKeyIsNotWorking />
    </div>
  );
}

function Layout() {
  return (
    <div className="absolute h-[986px] left-[350px] top-[140px] w-[1550px]" data-name="Layout">
      <Footer />
      <Input />
      <Button />
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-none left-[calc(50%+0.5px)] text-[#718096] text-[0px] text-[12px] text-center top-[899px] translate-x-[-50%] w-[715px]">
        <span>{`Free Research Preview. ChatGPT may produce inaccurate information about people, places, or facts. `}</span>
        <a className="[text-decoration-skip-ink:none] [text-underline-position:from-font] cursor-pointer decoration-solid text-[#120f43] underline" href="https://help.openai.com/en/articles/6825453-chatgpt-release-notes">
          <span className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-none text-[12px]" href="https://help.openai.com/en/articles/6825453-chatgpt-release-notes">
            ChatGPT May 12 Version
          </span>
        </a>
      </p>
      <Toggle />
      <NoPluginsEnabled />
      <ApiKeyCard />
    </div>
  );
}

function Text3() {
  return (
    <div className="absolute contents left-[49px] top-[52px]" data-name="Text">
      <p className="absolute font-['Poppins:Bold',sans-serif] leading-none left-[155px] not-italic text-[#1b2559] text-[0px] text-[26px] text-center text-nowrap top-[52px] translate-x-[-50%] whitespace-pre">
        <span>{`HORIZON `}</span>
        <span className="font-['Poppins:Regular',sans-serif]">AI FREE</span>
      </p>
    </div>
  );
}

function Logo() {
  return (
    <div className="absolute contents left-[49px] top-[52px]" data-name="Logo">
      <Text3 />
    </div>
  );
}

function Separator() {
  return (
    <div className="absolute h-0 left-0 top-[118px] w-[310px]" data-name="Separator">
      <div className="absolute bottom-0 left-0 right-0 top-[-1px]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 310 1">
          <g id="Separator">
            <line id="Separator_2" stroke="var(--stroke-0, #E9EDF7)" x2="310" y1="0.5" y2="0.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Pages() {
  return (
    <div className="absolute contents font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-none left-[72px] text-[#718096] text-[14px] text-nowrap top-[381px] whitespace-pre" data-name="Pages">
      <p className="absolute left-[72px] opacity-40 top-[381px]">Prompt Page</p>
      <p className="absolute left-[72px] opacity-40 top-[417px]">Register</p>
      <p className="absolute left-[72px] opacity-40 top-[453px]">Sign In</p>
    </div>
  );
}

function UserPages() {
  return (
    <div className="absolute contents left-[39px] top-[335px]" data-name="User Pages">
      <Pages />
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[30px] left-[72px] opacity-40 text-[#718096] text-[16px] text-nowrap top-[335px] whitespace-pre">Other Pages</p>
      <div className="absolute inset-[31.2%_82.26%_67.15%_12.58%] opacity-40" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 18">
          <path d={svgPaths.p2c3de000} fill="var(--fill-0, #718096)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Pages1() {
  return (
    <div className="absolute contents font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-none left-[72px] text-[#718096] text-[14px] text-nowrap top-[541px] whitespace-pre" data-name="Pages">
      <p className="absolute left-[72px] opacity-40 top-[541px]">All Templates</p>
      <p className="absolute left-[72px] opacity-40 top-[577px]">New Template</p>
      <p className="absolute left-[72px] opacity-40 top-[613px]">Edit Template</p>
      <p className="absolute left-[72px] opacity-40 top-[649px]">Users Overview</p>
    </div>
  );
}

function ChevronRight() {
  return (
    <div className="h-[10px] opacity-40 relative w-[20px]" data-name="chevron_right">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 10">
        <g clipPath="url(#clip0_1_254)" id="chevron_right">
          <g id="Vector"></g>
        </g>
        <defs>
          <clipPath id="clip0_1_254">
            <rect fill="white" height="10" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function AdminPages() {
  return (
    <div className="absolute contents left-[39px] top-[495px]" data-name="Admin Pages">
      <Pages1 />
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[30px] left-[72px] opacity-40 text-[#718096] text-[16px] text-nowrap top-[495px] whitespace-pre">Admin Pages</p>
      <div className="absolute inset-[45.62%_82.26%_52.55%_12.58%] opacity-40" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 20">
          <path d={svgPaths.paa61280} fill="var(--fill-0, #718096)" id="Vector" />
        </svg>
      </div>
      <div className="absolute flex h-[calc(1px*((var(--transform-inner-width)*1)+(var(--transform-inner-height)*0)))] items-center justify-center left-[254px] top-[502px] w-[calc(1px*((var(--transform-inner-height)*1)+(var(--transform-inner-width)*0)))]" style={{ "--transform-inner-width": "20", "--transform-inner-height": "9.984375" } as React.CSSProperties}>
        <div className="flex-none rotate-[90deg]">
          <ChevronRight />
        </div>
      </div>
    </div>
  );
}

function AutoAwesomeFill1Wght400Grad0Opsz481() {
  return (
    <div className="absolute inset-[14.78%_80.97%_83.03%_11.29%]" data-name="auto_awesome_FILL1_wght400_GRAD0_opsz48 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="auto_awesome_FILL1_wght400_GRAD0_opsz48 1">
          <path d={svgPaths.p3be3cb00} fill="var(--fill-0, #4318FF)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ChatUi() {
  return (
    <div className="absolute contents left-[35px] top-[159px]" data-name="Chat UI">
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-[30px] left-[72px] text-[#1b2559] text-[16px] text-nowrap top-[159px] whitespace-pre">Chat UI</p>
      <AutoAwesomeFill1Wght400Grad0Opsz481 />
    </div>
  );
}

function MyProjects() {
  return (
    <div className="absolute contents left-[39px] top-[219px]" data-name="My Projects">
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[30px] left-[72px] opacity-40 text-[#718096] text-[16px] text-nowrap top-[219px] whitespace-pre">My Projects</p>
      <div className="absolute inset-[20.44%_81.61%_77.74%_12.58%] opacity-40" data-name="Vector">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
          <path d={svgPaths.p31c13900} fill="var(--fill-0, #718096)" id="Vector" />
        </svg>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute left-[36px] opacity-40 size-[24px] top-[280px]" data-name="Icon">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g clipPath="url(#clip0_1_244)" id="Icon">
          <g id="Vector"></g>
          <path d={svgPaths.p385e9310} fill="var(--fill-0, #718096)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_1_244">
            <rect fill="white" height="24" width="24" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Templates() {
  return (
    <div className="absolute contents left-[36px] top-[277px]" data-name="Templates">
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[30px] left-[72px] opacity-40 text-[#718096] text-[16px] text-nowrap top-[277px] whitespace-pre">Templates</p>
      <Icon />
    </div>
  );
}

function ProBadge() {
  return (
    <div className="absolute bg-[#f2efff] h-[22px] left-[calc(50%+104px)] rounded-[39px] top-[223px] translate-x-[-50%] w-[50px]" data-name="PRO Badge">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[10px] h-[22px] items-center justify-center px-[26px] py-[6px] relative w-[50px]">
          <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[18px] leading-[16px] relative shrink-0 text-[#603cff] text-[12px] text-center w-[31px]">PRO</p>
        </div>
      </div>
    </div>
  );
}

function ProBadge1() {
  return (
    <div className="absolute bg-[#f2efff] h-[22px] left-[calc(50%+104px)] rounded-[39px] top-[283px] translate-x-[-50%] w-[50px]" data-name="PRO Badge">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[10px] h-[22px] items-center justify-center px-[26px] py-[6px] relative w-[50px]">
          <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[18px] leading-[16px] relative shrink-0 text-[#603cff] text-[12px] text-center w-[31px]">PRO</p>
        </div>
      </div>
    </div>
  );
}

function Pages2() {
  return (
    <div className="absolute contents left-[35px] top-[159px]" data-name="Pages">
      <UserPages />
      <AdminPages />
      <ChatUi />
      <MyProjects />
      <Templates />
      <ProBadge />
      {[...Array(2).keys()].map((_, i) => (
        <ProBadge1 key={i} />
      ))}
    </div>
  );
}

function ProBadge3() {
  return (
    <div className="absolute bg-[#f2efff] h-[22px] left-[calc(50%+104px)] rounded-[39px] top-[343px] translate-x-[-50%] w-[50px]" data-name="PRO Badge">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[10px] h-[22px] items-center justify-center px-[26px] py-[6px] relative w-[50px]">
          <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[18px] leading-[16px] relative shrink-0 text-[#603cff] text-[12px] text-center w-[31px]">PRO</p>
        </div>
      </div>
    </div>
  );
}

function ProBadge4() {
  return (
    <div className="absolute bg-[#f2efff] h-[22px] left-[calc(50%+104px)] rounded-[39px] top-[500px] translate-x-[-50%] w-[50px]" data-name="PRO Badge">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="box-border content-stretch flex gap-[10px] h-[22px] items-center justify-center px-[26px] py-[6px] relative w-[50px]">
          <p className="font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold h-[18px] leading-[16px] relative shrink-0 text-[#603cff] text-[12px] text-center w-[31px]">PRO</p>
        </div>
      </div>
    </div>
  );
}

function Avatar1() {
  return (
    <div className="absolute contents inset-0" data-name="Avatar">
      <div className="absolute inset-[-10%_-1.43%_-30%_-10%] mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[3.4px] mask-size-[34px_34px]" data-name="Elipse 5" style={{ maskImage: `url('${imgElipse7}')` }}>
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgElipse6} />
      </div>
      <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[34px_34px]" style={{ maskImage: `url('${imgElipse7}')` }}>
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
          <g id="Ellipse 5"></g>
        </svg>
      </div>
    </div>
  );
}

function AvatarStyle7() {
  return (
    <div className="absolute left-[41px] size-[34px] top-[1022px]" data-name="Avatar Style 6">
      <Avatar1 />
    </div>
  );
}

function BottomElements() {
  return (
    <div className="absolute contents left-[27px] top-[1008px]" data-name="Bottom Elements">
      <div className="absolute bg-white h-[62px] left-[27px] rounded-[30px] shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] top-[1008px] w-[256px]" />
      <AvatarStyle7 />
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none left-[calc(50%-22.5px)] text-[#1b2559] text-[14px] text-center text-nowrap top-[calc(50%+484px)] translate-x-[-50%] whitespace-pre">Adela Parkson</p>
    </div>
  );
}

function Logout() {
  return (
    <div className="absolute left-[235px] size-[34px] top-[1022px]" data-name="Logout">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 34 34">
        <g id="Logout">
          <rect height="33" rx="16.5" stroke="var(--stroke-0, #E0E5F2)" width="33" x="0.5" y="0.5" />
          <path d={svgPaths.p2fd21200} fill="var(--fill-0, #1B2559)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Group33079() {
  return (
    <div className="absolute left-[87.65px] size-[80.35px] top-[-40px]">
      <div className="absolute inset-[-23.4%_-42.55%_-61.7%_-42.55%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 149 149">
          <g id="Group 33079">
            <g filter="url(#filter0_d_1_264)" id="Ellipse 76">
              <circle cx="74.366" cy="58.9799" fill="url(#paint0_linear_1_264)" r="40.1747" />
              <circle cx="74.366" cy="58.9799" r="38.0378" stroke="var(--stroke-0, white)" strokeWidth="4.27391" />
            </g>
            <g id="Vector">
              <path d={svgPaths.p36352c00} fill="var(--fill-0, white)" />
              <path d={svgPaths.p6f7df70} fill="white" />
              <path clipRule="evenodd" d={svgPaths.p1c578300} fill="var(--fill-0, white)" fillRule="evenodd" />
            </g>
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="148.732" id="filter0_d_1_264" width="148.732" x="0" y="-9.53674e-07">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dy="15.3861" />
              <feGaussianBlur stdDeviation="17.0956" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.439216 0 0 0 0 0.564706 0 0 0 0 0.690196 0 0 0 0.12 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_264" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_264" mode="normal" result="shape" />
            </filter>
            <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_1_264" x1="82.1646" x2="99.252" y1="85.448" y2="23.6782">
              <stop stopColor="#4A25E1" />
              <stop offset="0.927091" stopColor="#7B5AFF" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="absolute bg-[rgba(255,255,255,0.14)] content-stretch flex h-[37px] items-center justify-center left-[32px] overflow-clip rounded-[45px] top-[177px] w-[192px]" data-name="Button">
      <p className="font-['Plus_Jakarta_Sans:SemiBold',sans-serif] font-semibold h-[20px] leading-[16px] relative shrink-0 text-[14px] text-center text-white w-[169px]">Get started with PRO</p>
    </div>
  );
}

function Credits() {
  return (
    <div className="absolute h-[246px] left-[27px] rounded-[16px] top-[736px] w-[256px]" data-name="Credits">
      <p className="absolute font-['Plus_Jakarta_Sans:Bold',sans-serif] font-bold leading-none left-[128px] text-[18px] text-center text-nowrap text-white top-[57px] translate-x-[-50%] whitespace-pre">Go unlimited with PRO</p>
      <p className="absolute font-['Plus_Jakarta_Sans:Medium',sans-serif] font-medium leading-[24px] left-1/2 text-[14px] text-center text-white top-[calc(50%-38px)] translate-x-[-50%] w-[208px]">Get your AI Project to another level and start doing more with Horizon AI Template PRO!</p>
      <Group33079 />
      <Button1 />
    </div>
  );
}

function Sidebar() {
  return (
    <div className="absolute bg-white h-[1096px] left-[20px] overflow-clip rounded-[20px] shadow-[0px_17px_40px_4px_rgba(112,144,176,0.11)] top-[30px] w-[310px]" data-name="Sidebar">
      <Logo />
      <Separator />
      <Pages2 />
      <ProBadge3 />
      <ProBadge4 />
      <BottomElements />
      <Logout />
      <Credits />
    </div>
  );
}

export default function ChatUiPageUser() {
  return (
    <div className="bg-white relative size-full" data-name="Chat UI Page (User)">
      <Menu />
      <Layout />
      <Sidebar />
    </div>
  );
}