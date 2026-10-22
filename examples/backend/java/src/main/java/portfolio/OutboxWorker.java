package portfolio;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;

// #region worker
// Registered as a bean in PortfolioConfig; @EnableScheduling there turns @Scheduled on.
public class OutboxWorker {
    private static final Logger log = LoggerFactory.getLogger(OutboxWorker.class);
    private final Runnable dispatcher;

    public OutboxWorker(Runnable dispatcher) {
        this.dispatcher = dispatcher;
    }

    // fixedDelay waits AFTER a pass finishes (like the C# loop); fixedRate would not.
    @Scheduled(fixedDelayString = "PT${integrations.poll-seconds:10}S")
    public void run() {
        try {
            dispatcher.run();
        } catch (Exception e) {
            log.error("The outbox pass failed; trying again on the next one.", e);
        }
    }
}
// #endregion
