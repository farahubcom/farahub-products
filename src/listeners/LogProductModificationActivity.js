const { Listener } = require('@farahub/framework/foundation');


class LogProductModificationActivity extends Listener {

    /**
     * handle the event
     * 
     * @param {Login} event event
     */
    async handle(event) {

        const Activity = event.connection.model('Activity');

        const eventIdentifier = 'products:product:'.concat(event.product.wasNew ? 'create' : 'update');
        const ActivityEvent = event.connection.model('ActivityEvent');
        const activityEvent = await ActivityEvent.findByIdentifierOrCreate(eventIdentifier, {
            'fa-IR': `{user} شخص {product} را ${event.product.wasNew ? 'ایجاد' : 'بروزرسانی'} کرد.`,
            'en-US': `{user} ${event.product.wasNew ? 'created' : 'updated'} {product}`
        });

        await Activity.createNew({
            event: activityEvent,
            user: event.user,
            references: [{
                reference: event.product.id,
                referenceModel: 'Product'
            }]
        });

        //
    }
}


module.exports = LogProductModificationActivity;