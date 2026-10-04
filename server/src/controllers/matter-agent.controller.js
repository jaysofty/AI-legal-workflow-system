import {
  runMatterAgent,
  runMatterAgentStream,
} from "../agents/matter/matter-agent.js";

export async function runMatterAgentController(
  req,
  res,
  next,
) {
  try {
    const result = await runMatterAgent({
      question: req.body.question,
      matterId: req.params.matterId,
      user: req.user,
    });

    return res.json({
      success: true,
      message: "Matter agent completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

function getStreamErrorMessage(error) {
  const status = error?.status || error?.statusCode;

  if (status === 429) {
    return "The Matter Agent is temporarily busy. Please wait a few seconds and try again.";
  }

  return error?.message || "The Matter Agent could not complete the request.";
}


export async function runMatterAgentStreamController(
  req,
  res,
  next,
) {
  let streamStarted = false;

  try {
    const stream = runMatterAgentStream({
      question: req.body.question,
      matterId: req.params.matterId,
      user: req.user,
    });

    res.status(200);

    res.setHeader(
      "Content-Type",
      "application/x-ndjson; charset=utf-8",
    );

    res.setHeader("Cache-Control", "no-cache, no-transform");

    res.setHeader("Connection", "keep-alive");

    /*
     * Helps prevent some reverse proxies from buffering
     * the streamed response.
     */
    res.setHeader("X-Accel-Buffering", "no");

    res.flushHeaders();

    streamStarted = true;

    for await (const event of stream) {
      res.write(`${JSON.stringify(event)}\n`);
    }

    res.end();
  } catch (error) {
    /*
     * If headers have not been sent yet, allow the normal
     * Express error middleware to handle the error.
     */
    if (!streamStarted && !res.headersSent) {
      return next(error);
    }

    /*
     * Once streaming has started, we cannot switch to a
     * normal JSON error response/status code.
     *
     * Instead, send an error event through the stream.
     */
    if (!res.writableEnded) {
     res.write(
       `${JSON.stringify({
         type: "error",
         message: getStreamErrorMessage(error),
       })}\n`,
     );

      res.end();
    }
  }
}