const through2 = require('through2')
const moment = require('moment')

const logRegex = /^(\w{3} \d\d \d\d:\d\d:\d\d) dnsmasq\[\d+\]: (reply (.+?) is (.+?)|query\[(.+?)\] (.+?) from (.+?)|forwarded (.+?) to (.+?)|config (.+?) is (.+?)|.+?\/gravity.list (.+?) is (.+?)|cached (.+?) is (.+?))$/

const logReader = through2.ctor({objectMode: true}, (chunk, enc, cb) => {
  const line = chunk.toString().trim()
  if (!line) {
    cb()
    return
  }
  const match = logRegex.exec(line)
  if (!match) {
    cb(null, {type: 'unknown', line, args: [line]})
    return
  }
  const date = moment(match[1], 'MMM DD HH:mm:ss')
  const [,,, reply1, reply2, query1, query2, query3, forwarded1, forwarded2, config1, config2, gravity1, gravity2, cached1, cached2] = match
  let type = 'unknown'
  let args = [line]
  if (reply1) {
    type = 'reply'
    args = [reply1, reply2]
  } else if (query1) {
    type = 'query'
    args = [query1, query2, query3]
  } else if (forwarded1) {
    type = 'forwarded'
    args = [forwarded1, forwarded2]
  } else if (config1) {
    type = 'config'
    args = [config1, config2]
  } else if (gravity1) {
    type = 'gravity'
    args = [gravity1, gravity2]
  } else if (cached1) {
    type = 'cached'
    args = [cached1, cached2]
  }
  cb(null, {
    line,
    date,
    type,
    args
  })
})

module.exports = logReader

if (require.main === module) {
  const spawn = require('child_process').spawn
  const ssh = spawn('ssh', ['-t', 'pi@pi.local', 'sudo tail -f -n 50 /var/log/pihole.log'])
  ssh.stdout
    .pipe(require('split')())
    .pipe(logReader())
    .pipe(through2.obj((chunk, enc, cb) => {
      process.stdout.write(JSON.stringify(chunk, null, 2).replace('\n', ''))
      process.stdout.write('\r\n')
      cb()
    }))
}
