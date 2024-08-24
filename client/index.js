import qs from "qs";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

class Client {
  username;
  password;
  axios;
  cookie = "";

  constructor({ username, password, host, port, scheme }) {
    this.username = username;
    this.password = password;
    this.axios = axios.create({
      baseURL: `${scheme}://${host}:${port}`,
      maxRedirects: 0,
    });
  }

  async login() {
    const credentials = qs.stringify({
      username: this.username,
      password: this.password,
    });
    const response = await this.axios
      .post("/login", credentials, {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
      })
      .catch(() => {});
    if (
      !response ||
      response.status !== 200 ||
      !response.data.success ||
      !response.headers["set-cookie"]
    ) {
      throw new Error("Failed to initialize session");
    }

    this.cookie = response.headers["set-cookie"][1].split(";")[0];
  }

  async getInbounds() {
    const response = await this.axios
      .post("/panel/inbound/list", null, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: this.cookie,
        },
      })
      .catch(() => {});
    if (!response || response.status !== 200 || !response.data.success) {
      throw new Error("getInbounds have failed");
    }
    return response.data.obj;
  }

  async addClient({ inboundId, email, totalGB }) {
    const settings = {
      clients: [
        {
          id: uuidv4(),
          flow: "xtls-rprx-vision",
          email,
          limitIp: 0,
          totalGB,
          expiryTime: 0,
          enable: true,
          tgId: "",
          subId: crypto.randomBytes(8).toString("hex"),
          reset: 0,
        },
      ],
    };
    const response = await this.axios
      .post(
        "/panel/inbound/addClient",
        qs.stringify({
          id: inboundId,
          settings: JSON.stringify(settings),
        }),
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            cookie: this.cookie,
          },
        }
      )
      .catch(() => {});
    if (!response || response.status !== 200 || !response.data.success) {
      throw new Error("addClient have failed");
    }
  }

  async delClient({ inboundId, clientId }) {
    const response = await this.axios
      .post(`/panel/inbound/${inboundId}/delClient/${clientId}`, null, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: this.cookie,
        },
      })
      .catch(() => {});
    if (!response || response.status !== 200 || !response.data.success) {
      throw new Error("delClient have failed");
    }
  }

  async updateClient({ inboundId, clientSettings }) {
    const settings = {
      clients: [clientSettings],
    };
    const response = await this.axios
      .post(
        `/panel/inbound/updateClient/${clientSettings.id}`,
        qs.stringify({
          id: inboundId,
          settings: JSON.stringify(settings),
        }),
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            cookie: this.cookie,
          },
        }
      )
      .catch(() => {});
    if (!response || response.status !== 200 || !response.data.success) {
      throw new Error("updateClient have failed");
    }
  }

  async resetClientTraffic({ inboundId, email }) {
    const response = await this.axios
      .post(`/panel/inbound/${inboundId}/resetClientTraffic/${email}`, null, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          cookie: this.cookie,
        },
      })
      .catch(() => {});
    if (!response || response.status !== 200 || !response.data.success) {
      throw new Error("resetClientTraffic have failed");
    }
  }
}

export default Client;
