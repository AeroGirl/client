var
	exec = require('child_process').exec
	, path = require('path')
	, node_updater = '/opt/utilities/bin/ninja_update_node'
	, otherTimeout = 2000 //timeout in ms for non-node updates
	, fs = require('fs')
;

module.exports = updater;
function updater(client) {

	client.prototype.updateHandler = function updateHandler(updateList) {
		var mod = this;
		updateList.map(updateCheck);
		function updateCheck(update) {
			try {

				fs.unlinkSync(mod.opts.updateLock + '_' + update);
			}
			catch(e) {

				mod.log.error("client: Update lock: %s", e);
			}
			if(update == 'node') { // client update!

				mod.app.emit('client::updating');
				var opts = {

					env : process.env
				};
				mod.log.info("client: Beginning update...");
				exec(node_updater, opts, function(err, stdout, stderr) {

					if(err) {

						mod.log.error("client: %s", err);
						return;
					}
					mod.log.info("client: Update complete. Restarting.");
					mod.log.debug(

						"client: Update utility output (%s): %s"
						, path.basename(node_updater)
						, stdout
					);
					process.exit();
				});
			}
			else { // non-node update, just restart.

				mod.log.info(

					"client: Update for %s. Restarting in %s seconds."
					, update
					, Math.round(otherTimeout / 1000)
				);
				setTimeout(process.exit, otherTimeout);
			}
		};
	};
};
