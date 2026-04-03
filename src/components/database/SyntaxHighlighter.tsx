import React from 'react';

interface SyntaxHighlighterProps {
  value: string;
  className?: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ value, className = '' }) => {
  const highlightSyntax = (text: string) => {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER',
      'TABLE', 'INDEX', 'DATABASE', 'SCHEMA', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
      'NULL', 'NOT', 'AND', 'OR', 'IN', 'LIKE', 'BETWEEN', 'ORDER', 'BY', 'GROUP', 'HAVING',
      'JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'OUTER', 'ON', 'AS', 'DISTINCT', 'COUNT',
      'SUM', 'AVG', 'MIN', 'MAX', 'UNION', 'ALL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE',
      'END', 'IF', 'ELSEIF', 'WHILE', 'DO', 'BEGIN', 'END', 'DECLARE', 'SET', 'RETURN',
      'TRUE', 'FALSE', 'IS', 'DEFAULT', 'AUTO_INCREMENT', 'UNSIGNED', 'ZEROFILL', 'COLLATE'
    ];

    const types = ['INT', 'VARCHAR', 'TEXT', 'BOOLEAN', 'DATE', 'DATETIME', 'TIMESTAMP', 'DECIMAL', 'FLOAT', 'DOUBLE', 'JSON', 'UUID'];

    let highlighted = text;

    // Highlight SQL keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="sql-keyword">${keyword}</span>`);
    });

    // Highlight data types
    types.forEach(type => {
      const regex = new RegExp(`\\b${type}\\b`, 'gi');
      highlighted = highlighted.replace(regex, `<span class="sql-type">${type}</span>`);
    });

    // Highlight strings
    highlighted = highlighted.replace(/'([^']*)'/g, '<span class="sql-string">\'$1\'</span>');
    highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="sql-string">"$1"</span>');

    // Highlight numbers
    highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="sql-number">$1</span>');

    // Highlight comments
    highlighted = highlighted.replace(/(--[^\n\r]*)/g, '<span class="sql-comment">$1</span>');
    highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="sql-comment">$1</span>');

    return highlighted;
  };

  return (
    <>
      <style>{`
        .sql-keyword {
          color: #0000ff;
          font-weight: bold;
        }
        .sql-type {
          color: #ff00ff;
          font-weight: bold;
        }
        .sql-string {
          color: #008000;
        }
        .sql-number {
          color: #ff0000;
        }
        .sql-comment {
          color: #808080;
          font-style: italic;
        }
      `}</style>
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: highlightSyntax(value) }}
      />
    </>
  );
};

export default SyntaxHighlighter;
