const { Listener } = require('@farahub/framework/foundation');


class LogProductDeletionActivity extends Listener {

    /**
     * handle the event
     * 
     * @param {Login} event event
     */
    async handle(event) {

        const Activity = event.connection.model('Activity');

        const eventIdentifier = 'products:product:delete';
        const ActivityEvent = event.connection.model('ActivityEvent');
        const activityEvent = await ActivityEvent.findByIdentifierOrCreate(eventIdentifier, {
            'fa-IR': `{user} محصول {product} را حذف کرد.`,
            'en-US': `{user} deleted {product}`
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


module.exports = LogProductDeletionActivity;