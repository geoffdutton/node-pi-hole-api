
const byCommand = {}

const stats = `domains_being_blocked 136704
dns_queries_today 26969
ads_blocked_today 15116
ads_percentage_today 56.049538
unique_domains 654
queries_forwarded 9146
queries_cached 2706
clients_ever_seen 5
unique_clients 5
dns_queries_all_types 26969
reply_NODATA 1552
reply_NXDOMAIN 85
reply_CNAME 3778
reply_IP 11000
privacy_level 0
status enabled
---EOM---

`

const clientNames = `104-54-196-251.lightspeed.austtx.sbcglobal.net 104.54.196.251
localhost 127.0.0.1
 129.204.58.88
 71.6.202.205
 178.128.10.121
---EOM---


`
byCommand['client-names'] = clientNames

const topAds = `0 5676 cws-hulu.conviva.com
1 4904 vortex.hulu.com
2 1301 mobile-collector.newrelic.com
3 1188 t2.hulu.com
4 583 msmetrics.ws.sonos.com
5 477 c.p.hulu.com
6 170 nexus-websocket-b.intercom.io
7 168 nexus.officeapps.live.com
8 133 ade.googlesyndication.com
9 112 js.driftt.com
---EOM---

`
byCommand['top-ads'] = topAds
byCommand['top-ads for audit'] = topAds
byCommand['top-ads (99)'] = topAds

const topDomains = `0 650 play.hulu.com.akadns.net
1 568 play.hulu.com
2 562 origin-home.hulu.com.akadns.net
3 552 home.hulu.com
4 360 phd.aws.amazon.com
5 323 http-v-darwin.hulustream.com
6 246 http-v-darwin.hulu.com.c.footprint.net
7 239 e673.dsce9.akamaiedge.net
8 234 client.dropbox.com
9 228 e1042.b.akamaiedge.net
---EOM---

`
byCommand['top-domains'] = topDomains
byCommand['top-domains for audit'] = topDomains
byCommand['top-domains (99)'] = topDomains

const topClients = `0 28830 104.54.196.251 104-54-196-251.lightspeed.austtx.sbcglobal.net
1 271 127.0.0.1 localhost
2 1 129.204.58.88 
3 1 71.6.202.205 
4 1 178.128.10.121 
5 1 74.82.47.22 scan-09e.shadowserver.org
---EOM---
`
byCommand['top-clients'] = topClients
byCommand['top-clients (33)'] = topClients

const topClientsBlocked = `0 16479 104.54.196.251 104-54-196-251.lightspeed.austtx.sbcglobal.net
1 3 127.0.0.1 localhost
---EOM---
`
byCommand['top-clients blocked'] = topClientsBlocked
byCommand['top-clients blocked (77)'] = topClientsBlocked

const forwardDest = `-2 56.12 blocklist blocklist
-1 9.88 cache cache
0 13.54 1.1.1.1 one.one.one.one
1 9.97 1.0.0.1 one.one.one.one
2 5.58 8.8.4.4 google-public-dns-b.google.com
3 4.85 8.8.8.8 google-public-dns-a.google.com
4 0.06 2606:4700:4700::1001 one.one.one.one
---EOM---`

byCommand['forward-dest'] = forwardDest
byCommand['forward-dest unsorted'] = forwardDest
byCommand['forward-names'] = forwardDest

const queryTypes = `A (IPv4): 48.45
AAAA (IPv6): 50.50
ANY: 0.03
SRV: 0.01
SOA: 0.02
PTR: 0.96
TXT: 0.03
---EOM---

`
byCommand['querytypes'] = queryTypes

const cacheInfo = `cache-size: 10000
cache-live-freed: 0
cache-inserted: 20273
---EOM---

`
byCommand['cacheinfo'] = cacheInfo

const overTimeDataQueryTypes = `1546056300 0.00 0.00
1546056900 46.76 53.24
1546057500 46.45 53.55
1546058100 45.89 54.11
1546058700 47.22 52.78
1546059300 45.00 55.00
1546059900 47.44 52.56
1546060500 46.84 53.16
1546061100 46.67 53.33
1546061700 44.59 55.41
1546062300 46.96 53.04
 ---EOM---
`
byCommand['QueryTypesoverTime'] = overTimeDataQueryTypes

byCommand['ClientsoverTime'] = `1546056300 215 3 0 0 0 0
1546056900 139 0 0 0 0 0
1546057500 155 0 0 0 0 0
1546058100 146 0 0 0 0 0
1546058700 144 0 0 0 0 0
1546059300 160 0 0 0 0 0
1546059900 156 3 0 0 0 0
 ---EOM---
`

byCommand['recentBlocked'] = `vortex.hulu.com
---EOM---`

byCommand['getallqueries'] = `1546139804 AAAA browsetech.slack.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 1 19
1546139809 AAAA home.hulu.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 3 11
1546139809 A home.hulu.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 3 119
1546139809 A cws-hulu.conviva.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 1 0 4 2
1546139809 AAAA cws-hulu.conviva.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 1 0 4 0
1546139811 AAAA play.hulu.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 3 525
1546139811 A play.hulu.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 3 10
1546139817 A phd.aws.amazon.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 3 553
1546139817 AAAA phd.aws.amazon.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 2 0 3 605
1546139823 A msmetrics.ws.sonos.com 104-54-196-251.lightspeed.austtx.sbcglobal.net 1 0 4 1
---EOM---

`

const overTime = `1546056300 218 127
1546056900 139 100
1546057500 155 116
1546058100 146 104
1546058700 144 108
1546059300 160 116
1546059900 159 130
1546060500 190 141
1546061100 105 80
1546061700 148 106
1546062300 181 132
1546062900 169 128
1546063500 136 86
1546064100 113 84
1546064700 160 106
1546065300 127 92
1546065900 149 112
1546066500 169 122
1546067100 127 92
1546067700 159 112
1546068300 135 96
1546068900 183 126
1546069500 128 94
1546070100 152 104
1546070700 155 106
1546071300 155 104
1546071900 232 162
1546072500 144 102
1546073100 190 132
1546073700 123 96
1546074300 141 98
1546074900 164 122
1546075500 175 148
1546076100 180 128
1546076700 124 90
1546077300 164 114
1546077900 179 118
1546078500 129 96
1546079100 186 132
1546079700 157 120
1546080300 173 126
1546080900 135 100
1546081500 164 116
1546082100 163 82
1546082700 50 8
1546083300 5 0
1546083900 70 14
1546084500 243 38
1546085100 367 37
1546085700 124 25
1546086300 172 13
1546086900 277 90
1546087500 323 170
1546088100 387 111
1546088700 516 269
1546089300 435 230
1546089900 329 158
1546090500 378 167
1546091100 333 143
1546091700 321 144
1546092300 346 144
1546092900 283 138
1546093500 264 81
1546094100 268 142
1546094700 152 118
1546095300 158 126
1546095900 193 136
1546096500 162 118
1546097100 195 138
1546097700 146 116
1546098300 150 116
1546098900 189 132
1546099500 168 130
1546100100 182 134
1546100700 267 118
1546101300 150 120
1546101900 201 148
1546102500 126 108
1546103100 182 114
1546103700 162 130
1546104300 189 136
1546104900 160 118
1546105500 192 138
1546106100 146 118
1546106700 364 130
1546107300 399 163
1546107900 258 141
1546108500 350 148
1546109100 272 143
1546109700 334 169
1546110300 377 146
1546110900 274 150
1546111500 400 182
1546112100 242 139
1546112700 370 163
1546113300 313 144
1546113900 392 179
1546114500 289 138
1546115100 261 145
1546115700 412 168
1546116300 270 150
1546116900 302 151
1546117500 274 144
1546118100 300 150
1546118700 342 158
1546119300 256 140
1546119900 259 168
1546120500 292 160
1546121100 327 174
1546121700 301 152
1546122300 298 167
1546122900 235 150
1546123500 235 136
1546124100 267 152
1546124700 260 138
1546125300 295 146
1546125900 321 150
1546126500 338 187
1546127100 284 152
1546127700 258 145
1546128300 283 158
1546128900 253 138
1546129500 265 146
1546130100 83 48
---EOM---


`

byCommand['overTime'] = overTime

module.exports = {
  stats,
  clientNames,
  overTime,
  topAds,
  topDomains,
  topClients,
  topClientsBlocked,
  forwardDest,
  queryTypes,
  cacheInfo,
  overTimeDataQueryTypes,
  byCommand
}
