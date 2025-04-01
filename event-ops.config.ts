interface Config {
  prefix: string;
  shortUrl: {
    baseUrl: string;
  };
  connpass: {
    baseUrl: string;
  };
  exportFileName?: string;
}

const defaultConfig: Config = {
  prefix: "event",
  shortUrl: {
    baseUrl: "https://bit.ly",
  },
  connpass: {
    baseUrl: "xxxxx.connpass.com",
  },
  exportFileName: "event-settings.json",
};

export default defaultConfig;
