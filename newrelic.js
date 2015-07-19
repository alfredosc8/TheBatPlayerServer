/**
 * New Relic agent configuration.
 *
 * See lib/config.defaults.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * Array of application names.
   */
  app_name: ['The Bat Server'],
  /**
   * Your New Relic license key.
   */
  license_key: '455c50abdec9e44d28b2f43c6bdd8d37123d9657',
  logging: {
    filepath: "./newrelic_agent.log",
    /**
     * Level at which to log. 'trace' is most useful to New Relic when diagnosing
     * issues with the agent, 'info' and higher will impose the least overhead on
     * production applications.
     */
    level: 'info'
  }
};
