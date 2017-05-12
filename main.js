Vue.component('message-list', {
    props: ['items'],

    template: '\
        <div class="field">\
            <p class="control">\
                <message v-for="m in items" :key="m.topic">\
                    <div slot="topic">{{m.topic}}</div> \
                    <div slot="payload">{{m.payload}}</div> \
                </message>\
            </p>\
        </div>'
})


Vue.component('message', {
    template: '\
        <article class = "message" v-show="isVisible" >\
            <div class="message-header">\
                <slot name="topic"></slot>\
                <button class="delete" @click="toggleMe"></button>\
            </div>\
            <div class = "message-body" >\
                <slot name="payload"></slot>\
            </div>\
        </article>\
    ',

    data: function() {
        return {
            isVisible: true
        }
    },

    methods: {
        toggleMe: function() {
            this.isVisible = false
        }
    }
})


var connection = new Vue({
    el: '#connection',
    data: {
        host: '',
        port: '',
        status: false,
        statusIcon: 'fa fa-times',
        clientId: '',
        cleanSession: true,
        username: '',
        password: '',
        notification: 'No Connection',
        willTopic: '',
        willPayload: '',
        willQoS: 0,
        willRetain: false,
        pubTopic: '',
        pubQoS: 0,
        retain: false,
        payload: '',
        subTopic: '',
        subQoS: 0,
        subAck: '',
        disabledBtn: true,
        items: []
    },
    methods: {
        connect: function() {
            client = new Paho.MQTT.Client(this.host, Number(this.port), this.clientId)
            var options = {
                userName: this.username,
                password: this.password,
                cleanSession: this.cleanSession,
                onSuccess: onConnect,
                onFailure: onFailure
            }
            if (this.willTopic != '') {
                will = new Paho.MQTT.Message(this.willPayload)
                will.destinationName = this.willTopic
                will.qos = Number(this.willQoS)
                will.retained = this.willRetain
                options.willMessage = will
            }
            client.onConnectionLost = onConnectionLost;
            client.onMessageArrived = onMessageArrived;
            client.connect(options);
        },
        subscribe: function() {
            var options = {
                qos: this.subQoS,
                onSuccess: onSubSuccess,
                onFailure: onSubFailure
            };
            client.subscribe(this.subTopic, options);
        },
        publish: function() {
            client.send(this.pubTopic, this.payload, Number(this.pubQoS), this.retain)
        },
        toggleCS: function() {
            this.cleanSession = !this.cleanSession
        },
        toggleRetain: function() {
            this.retain = !this.retain
        },
        toggleWillRetain: function() {
            this.willRetain = !this.willRetain
        }
    }
})

function updateValues(status, notification) {
    connection.notification = notification
    connection.status = status
    if (status) {
        connection.statusIcon = "fa fa-check"
        connection.disabledBtn = false
    } else {
        connection.statusIcon = "fa fa-times"
        connection.disabledBtn = true
        connection.subAck = ""
    }
}

function onConnect() {
    updateValues(true, "Connected")
}

function onFailure(message) {
    updateValues(false, "Fail to Connect")
    console.log(message)
}

function onConnectionLost(responseObject) {
    updateValues(false, "Connection Lost")
    if (responseObject.errorCode !== 0) {
        console.log("onConnectionLost:" + responseObject.errorMessage);
    }
}

function onMessageArrived(message) {
    var topic = message.destinationName;
    var payload = message.payloadString;
    connection.items.unshift({
        topic: topic,
        payload: payload
    })
}

function onSubFailure(message) {
    connection.subAck = "Fail to subscribe!"
    console.log(message)
}

function onSubSuccess(message) {
    connection.subAck = "Subscribe!"
    console.log(message)
}
