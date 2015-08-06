package gov.usgs.cida.proxy;

import gov.usgs.cida.config.DynamicReadOnlyProperties;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import javax.naming.NamingException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.apache.commons.lang.StringUtils;
import org.apache.http.client.methods.HttpUriRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.openqa.selenium.WebDriver;

public class JavaScriptExecutingProxyServlet extends HttpServlet {

    private static final Logger log = LoggerFactory.getLogger(AlternateProxyServlet.class);
    protected static DynamicReadOnlyProperties props = null;
    public static final int DEFAULT_WEB_DRIVER_TIMEOUT = 1000 * 60 * 5;
    public static final String DEFAULT_WEB_DRIVER_URL = "127.0.0.1:8910";
    private static final long serialVersionUID = 1L;
    private String webDriverUrl;
    private int webDriverTimeout;

    @Override
    public void init() throws ServletException {
        super.init();

        try {
            props = new DynamicReadOnlyProperties().addJNDIContexts(new String[0]);
        } catch (NamingException e) {
            log.warn("Error occured during initProps()", e);
        }

        this.webDriverTimeout = getIntParam("web-driver-timeout", "web-driver-timeout-param", DEFAULT_WEB_DRIVER_TIMEOUT);

        this.webDriverUrl = getStringParam("web-driver-url", "web-driver-url-param", DEFAULT_WEB_DRIVER_URL);

        if (StringUtils.equals(this.webDriverUrl, DEFAULT_WEB_DRIVER_URL)) {
            log.warn("web-driver-url was not specified in web.xml. Defaulting to " + DEFAULT_WEB_DRIVER_URL);
        }

    }

    @Override
    public void destroy() {
        super.destroy();
    }

    @Override
    protected void service(HttpServletRequest clientRequest, HttpServletResponse clientResponse) throws ServletException, IOException {
        try {
            //create a web driver
            //connect to it
            //get the desired url
            //wait
            //get the JS-processed source
            
        } catch (Exception e) {
            // log a little more information to help with debugging as this is a bas state...
            StringBuilder logMessageBuilder = new StringBuilder();
            logMessageBuilder.append("Uncaught exception handling JS proxy request to").
                    append(getClientRequestURIAsString(clientRequest));
                    
            log.error(logMessageBuilder.toString(), e);
        } finally {
            clientResponse.flushBuffer();
        }
    }

    protected HttpUriRequest generateServerRequest(HttpServletRequest clientRequest) throws ProxyException {
        HttpUriRequest serverRequest = null;
        try {

            // 1) Generate Server URI
            String serverRequestURIAsString = getServerRequestURIAsString(clientRequest);
            // instantiating to URL then calling toURI gives us some error
            // checking as URI(String) appears too forgiving.
            URI serverRequestURI = (new URL(serverRequestURIAsString)).toURI();

            // 2 ) Create request base on client request method
            String clientRequestMethod = clientRequest.getMethod();
            if ("GET".equals(clientRequestMethod)) {
                throw new ProxyException("Unsupported request method, " + clientRequestMethod);
            }

            // 3) Map client request headers to server request
            generateServerRequestHeaders(clientRequest, serverRequest);

        } catch (MalformedURLException e) {
            throw new ProxyException("Syntax error parsing server URL", e);
        } catch (URISyntaxException e) {
            throw new ProxyException("Syntax error parsing server URI", e);
        }

        return serverRequest;
    }

    protected String getClientRequestURIAsString(HttpServletRequest clientRequest) {
        return clientRequest.getRequestURL().toString();
    }

        /**
     * TODO, this returns the wrong stuff when there isn't an ending slash.
     *
     * @param clientrequest
     * @return
     */
    protected String getServerRequestURIAsString(HttpServletRequest clientrequest) {
        throw new RuntimeException("Not implemented");
    }
    
    protected void generateServerRequestHeaders(HttpServletRequest clientRequest, HttpUriRequest serverRequest) {
        throw new RuntimeException("Not implemented");
    }
    
    private Object getParamFromInitOrJNDI(String initParam, String initParamJNDIName, Object defaultValue) {
        Object result = defaultValue;
        String jndiParamName = this.getInitParameter(initParamJNDIName);
        String paramValue = StringUtils.isBlank(jndiParamName) ? this.getInitParameter(initParam)
				: props.getProperty(jndiParamName, this.getInitParameter(initParam));
        if (null != paramValue) {
            result = paramValue;
        }
        return result;
    }
    
    protected int getIntParam(String initParam, String initParamJNDIName, Integer defaultValue) throws ServletException{
        int intValue;
        Object param = getParamFromInitOrJNDI(initParam, initParamJNDIName, defaultValue);
        try {
            if (param instanceof String) {
                intValue = Integer.parseInt((String)param);
            } else if (param instanceof Integer) {
                intValue = (Integer)param;
            } else {
                throw new IllegalArgumentException("Integer params only please");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
        return intValue;
    }
    
    protected long getLongParam(String initParam, String initParamJNDIName, Long defaultValue) throws ServletException{
        long longValue;
        Object param = getParamFromInitOrJNDI(initParam, initParamJNDIName, defaultValue);
        try {
            if (param instanceof String) {
                longValue = Long.parseLong((String)param);
            } else if (param instanceof Long) {
                longValue = (Long)param;
            } else {
                throw new IllegalArgumentException("Long params only please");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
        return longValue;
    }
    
    protected boolean getBoolParam(String initParam, String initParamJNDIName, Boolean defaultValue) throws ServletException{
        boolean boolValue;
        Object param = getParamFromInitOrJNDI(initParam, initParamJNDIName, defaultValue);
        try {
            if (param instanceof String) {
                boolValue = Boolean.parseBoolean((String)param);
            } else if (param instanceof Boolean) {
                boolValue = (Boolean)param;
            } else {
                throw new IllegalArgumentException("Boolean params only please");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
        return boolValue;
    }
    
    protected String getStringParam(String initParam, String initParamJNDIName, String defaultValue) throws ServletException{
        String strValue;
        Object param = getParamFromInitOrJNDI(initParam, initParamJNDIName, defaultValue);
        try {
            if (param instanceof String) {
                strValue = (String)param;
            } else {
                throw new IllegalArgumentException("String params only please");
            }
        } catch (Exception e) {
            throw new ServletException(e);
        }
        return strValue;
    }

    public static class ProxyException extends Exception {

        public ProxyException(String message) {
            super(message);
        }

        public ProxyException(String message, Throwable cause) {
            super(message, cause);
        }

        public Throwable getRootCause() {
            return getRootCause(getCause());
        }

        private Throwable getRootCause(Throwable t) {
            return t.getCause() == null ? t : getRootCause(t.getCause());
        }
    }
}
