# 3X-UI client

## init client

```.js
(async () => {
  const panelClient = new Client({
    username: process.env.PANEL_USER,
    password: process.env.PANEL_PASSWORD,
    host: process.env.PANEL_HOST,
    port: process.env.PANEL_PORT,
    scheme: process.env.PANEL_SCHEME,
  });

  // call login once before other calls
  await panelClient.login();
})();
```

## list clients

```.js
const inbounds = await panelClient.getInbounds();
// find vless inbound
const inbound = inbounds.find((inbound) => inbound.protocol === "vless");
console.log(inbound.id);
const { clientStats, settings } = inbound;
clientStats.forEach((clientStat) =>
  console.log(
    clientStat.id,
    clientStat.enable,
    clientStat.email,
    (clientStat.up + clientStat.down) / 1024 / 1024 / 1024
  )
);
const settingsObj = JSON.parse(settings);
console.log(settingsObj.clients);
```

## create clients

```.js
const inboundId = 1;

await panelClient.addClient({
  inboundId,
  email: "test1",
  totalGB: 0, // no traffic limit
});
await panelClient.addClient({
  inboundId,
  email: "test2",
  totalGB: 107374182400, // 100Gb traffic limit
});
```

## delete client

```.js
const clientId = "ee323510-958a-41cb-9de8-74541b54be38";
await panelClient.delClient({ inboundId, clientId });
```

## update client

```
const client = settingsObj.clients.find((client) => client.email === "test1");
panelClient.updateClient({
  inboundId,
  clientSettings: {
    ...client,
    enable: false,
  },
});
```
